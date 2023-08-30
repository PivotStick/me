import { basename } from "path";
import { parse } from "./compiler/parse";
import { existsSync } from "fs";
import { b, x, p, print } from "code-red";

/**
 * @returns {import("vite").Plugin}
 */
export const zone = () => {
    return {
        name: "vite-plugin-zone",

        transform(code, id, options) {
            if (id.endsWith(".twig")) {
                const jsPath = id.replace(".twig", ".js");
                const hasJS = existsSync(jsPath);

                const ast = parse(code);

                const generateVDOM = (node) => {
                    switch (node.type) {
                        case "Element": {
                            const args = [x`"${node.name}"`];
                            if (node.attributes.length) {
                                const attributes = x`{${node.attributes.map(
                                    (attr) => p`"${attr.name}": "${attr.value}"`
                                )}}`;

                                args.push(attributes);
                            }

                            if (node.children.length) {
                                const children = node.children.map((child) =>
                                    generateVDOM(child)
                                );

                                args.push(x`[${children}]`);
                            }

                            return x`h(${args})`;
                        }

                        case "MustacheExpression": {
                            return x`props.${node.expression}`;
                        }

                        case "Text": {
                            return x`"${node.value}"`;
                        }
                    }
                };

                const vdom = x`h(Fragment, [
                    ${ast.html.fragments.map((node) => generateVDOM(node))}
                ])`;

                const body = b`
                    import { h, render, Fragment } from "vue";
                    ${
                        hasJS
                            ? `import instantiate from "./${basename(jsPath)}"`
                            : ""
                    }

                    export default class Component {
                        target;
                        ${hasJS ? "instance" : ""}

                        constructor({ target, props = {} }) {
                            this.target = target;
                            ${
                                hasJS
                                    ? x`this.instance = instantiate(target, props, () => this.render(props))`
                                    : ""
                            }
                            this.render(props);
                            ${hasJS ? x`this.instance.onMount()` : ""}
                        }

                        render(props) {
                            const vdom = ${vdom};
                            render(vdom, this.target);
                        }
                    }
                `;

                return print({
                    type: "Program",
                    sourceType: "module",
                    body,
                });
            }
        },
    };
};
