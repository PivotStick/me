import { basename } from "path";
import { parse } from "./compiler/parse";
import { existsSync } from "fs";
import { b, x, p, print } from "code-red";
import { Lexer, TokenType } from "twig-lexer";

// const lexer = new Lexer();
// const tokens = lexer.tokenize(`
//     <script>
//         let name = "bonsoir";
//     </script>

//     <h1>{{ name|upper }}</h1>
//     {% if name == "Jeff" %}
//         <p>Woaw gg!</p>
//     {% endif %}
// `);

// if (match(TokenType.TAG_START, TokenType.WHITESPACE, TokenType.NAME))

// console.log(tokens);

/**
 * @returns {import("vite").Plugin}
 */
export const zone = () => {
    return {
        name: "vite-plugin-zone",

        transform(code, id, options) {
            if (id.endsWith(".twig")) {
                const jsPath = id.replace(".twig", ".js");
                const scssPath = id.replace(".twig", ".scss");
                const hasJS = existsSync(jsPath);
                const hasScss = existsSync(scssPath);

                const ast = parse(code);

                const generateVDOM = (node, parent) => {
                    switch (node.type) {
                        case "Element": {
                            const args = [x`"${node.name}"`];
                            if (node.attributes.length) {
                                const attributes = x`{${node.attributes.map(
                                    (attr) => {
                                        if (attr.name.startsWith("on:")) {
                                            if (!hasJS) return "";
                                            const eventName =
                                                attr.name.slice(3);

                                            return p`${
                                                "on" + eventName
                                            }: this.instance["${attr.value}"]`;
                                        }

                                        return p`"${attr.name}": "${attr.value}"`;
                                    }
                                )}}`;

                                args.push(attributes);
                            }

                            if (node.children.length) {
                                const children = node.children.map((child) =>
                                    generateVDOM(child, node)
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

                const vnode = x`h(Fragment, [
                    ${ast.html.fragments.map((node) => generateVDOM(node))}
                ])`;

                const imports = [b`import { h, render, Fragment } from "vue"`];

                if (hasJS)
                    imports.push(
                        b`import instantiate from "./${basename(jsPath)}"`
                    );
                if (hasScss) imports.push(b`import "./${basename(scssPath)}"`);

                const body = b`
                    ${imports.flat()}

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
                            ${hasJS ? x`this.instance.onMount?.()` : ""}
                        }

                        render(props) {
                            const vnode = ${vnode};
                            render(vnode, this.target);
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
