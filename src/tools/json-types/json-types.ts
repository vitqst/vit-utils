export type TypeDeclarationMode = "interface" | "type";

type PrimitiveName = "string" | "number" | "boolean" | "null";

type TypeNode =
  | { kind: PrimitiveName }
  | { kind: "unknown" }
  | { kind: "array"; element: TypeNode }
  | { kind: "object"; properties: Map<string, PropertyNode> }
  | { kind: "union"; nodes: TypeNode[] };

interface PropertyNode {
  node: TypeNode;
  optional: boolean;
}

function inferNode(value: unknown): TypeNode {
  if (value === null) return { kind: "null" };
  if (typeof value === "string") return { kind: "string" };
  if (typeof value === "number") return { kind: "number" };
  if (typeof value === "boolean") return { kind: "boolean" };

  if (Array.isArray(value)) {
    if (!value.length) return { kind: "array", element: { kind: "unknown" } };
    return {
      kind: "array",
      element: value.map(inferNode).reduce(mergeNodes),
    };
  }

  if (typeof value === "object") {
    return {
      kind: "object",
      properties: new Map(
        Object.entries(value as Record<string, unknown>).map(([key, item]) => [
          key,
          { node: inferNode(item), optional: false },
        ]),
      ),
    };
  }

  return { kind: "unknown" };
}

function nodeKey(node: TypeNode): string {
  if (node.kind === "array") return `array:${nodeKey(node.element)}`;
  if (node.kind === "union") {
    return `union:${node.nodes.map(nodeKey).sort().join("|")}`;
  }
  if (node.kind === "object") {
    return `object:${[...node.properties]
      .map(
        ([key, property]) =>
          `${key}${property.optional ? "?" : ""}:${nodeKey(property.node)}`,
      )
      .sort()
      .join(",")}`;
  }
  return node.kind;
}

function unionNodes(nodes: TypeNode[]): TypeNode {
  const flattened = nodes.flatMap((node) =>
    node.kind === "union" ? node.nodes : [node],
  );
  const unique = flattened.filter(
    (node, index) =>
      flattened.findIndex((candidate) => nodeKey(candidate) === nodeKey(node)) ===
      index,
  );
  return unique.length === 1 ? unique[0] : { kind: "union", nodes: unique };
}

function mergeObjects(
  left: Extract<TypeNode, { kind: "object" }>,
  right: Extract<TypeNode, { kind: "object" }>,
): TypeNode {
  const properties = new Map<string, PropertyNode>();
  const keys = new Set([
    ...left.properties.keys(),
    ...right.properties.keys(),
  ]);

  for (const key of keys) {
    const leftProperty = left.properties.get(key);
    const rightProperty = right.properties.get(key);
    if (leftProperty && rightProperty) {
      properties.set(key, {
        node: mergeNodes(leftProperty.node, rightProperty.node),
        optional: leftProperty.optional || rightProperty.optional,
      });
    } else {
      const property = leftProperty ?? rightProperty;
      if (property) {
        properties.set(key, { node: property.node, optional: true });
      }
    }
  }
  return { kind: "object", properties };
}

function mergeNodes(left: TypeNode, right: TypeNode): TypeNode {
  if (nodeKey(left) === nodeKey(right)) return left;
  if (left.kind === "unknown") return right;
  if (right.kind === "unknown") return left;
  if (left.kind === "object" && right.kind === "object") {
    return mergeObjects(left, right);
  }
  if (left.kind === "array" && right.kind === "array") {
    return { kind: "array", element: mergeNodes(left.element, right.element) };
  }
  return unionNodes([left, right]);
}

function pascalCase(value: string) {
  const words = value.match(/[A-Za-z0-9]+/g) ?? [];
  const joined = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  const name = joined || "Root";
  return /^\d/.test(name) ? `Type${name}` : name;
}

function singular(value: string) {
  if (/ies$/i.test(value)) return `${value.slice(0, -3)}y`;
  if (/ses$/i.test(value)) return value.slice(0, -2);
  if (/s$/i.test(value) && !/ss$/i.test(value)) return value.slice(0, -1);
  return value;
}

function propertyName(value: string) {
  return /^[A-Za-z_$][\w$]*$/.test(value) ? value : JSON.stringify(value);
}

interface Declaration {
  name: string;
  node: Extract<TypeNode, { kind: "object" }>;
}

function createEmitter(rootName: string, mode: TypeDeclarationMode) {
  const names = new Map<Extract<TypeNode, { kind: "object" }>, string>();
  const declarations: Declaration[] = [];
  const usedNames = new Set<string>();

  const uniqueName = (requested: string) => {
    const base = pascalCase(requested);
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate)) {
      candidate = `${base}${suffix}`;
      suffix += 1;
    }
    usedNames.add(candidate);
    return candidate;
  };

  const register = (
    node: Extract<TypeNode, { kind: "object" }>,
    requestedName: string,
  ) => {
    const existing = names.get(node);
    if (existing) return existing;
    const name = uniqueName(requestedName);
    names.set(node, name);
    declarations.push({ name, node });

    for (const [key, property] of node.properties) {
      registerNested(property.node, singular(key));
    }
    return name;
  };

  const registerNested = (node: TypeNode, requestedName: string): void => {
    if (node.kind === "object") {
      register(node, requestedName);
    } else if (node.kind === "array") {
      registerNested(node.element, singular(requestedName));
    } else if (node.kind === "union") {
      node.nodes.forEach((item) => registerNested(item, requestedName));
    }
  };

  const typeText = (node: TypeNode): string => {
    if (
      node.kind === "string" ||
      node.kind === "number" ||
      node.kind === "boolean" ||
      node.kind === "null" ||
      node.kind === "unknown"
    ) {
      return node.kind;
    }
    if (node.kind === "object") return names.get(node) ?? "unknown";
    if (node.kind === "union") {
      return node.nodes.map(typeText).join(" | ");
    }
    if (node.kind === "array") {
      const element = typeText(node.element);
      return node.element.kind === "union" ? `(${element})[]` : `${element}[]`;
    }
    return node.kind;
  };

  const declarationText = ({ name, node }: Declaration) => {
    const properties = [...node.properties]
      .map(
        ([key, property]) =>
          `  ${propertyName(key)}${property.optional ? "?" : ""}: ${typeText(property.node)};`,
      )
      .join("\n");
    return mode === "interface"
      ? `interface ${name} {\n${properties}\n}`
      : `type ${name} = {\n${properties}\n};`;
  };

  const emit = (root: TypeNode) => {
    const normalizedRootName = pascalCase(rootName);
    let rootAlias = "";

    if (root.kind === "object") {
      register(root, normalizedRootName);
    } else if (root.kind === "array" && root.element.kind === "object") {
      const itemName = register(root.element, normalizedRootName);
      rootAlias = `type ${itemName}List = ${itemName}[];`;
    } else {
      registerNested(root, normalizedRootName);
      rootAlias = `type ${normalizedRootName} = ${typeText(root)};`;
    }

    const output = declarations.map(declarationText);
    if (rootAlias) output.push(rootAlias);
    return output.join("\n\n");
  };

  return { emit };
}

export function jsonToTypeScript(
  source: string,
  rootName: string,
  mode: TypeDeclarationMode,
) {
  const value: unknown = JSON.parse(source);
  return createEmitter(rootName, mode).emit(inferNode(value));
}
