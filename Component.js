import { twig } from "twig";
import { parseHtml } from "./parseHtml";
import * as vue from "vue";

/** @type {Map<string, import("vue").DefineComponent} */
const components = new Map();

/**
 * @param {*} node
 * @param {Record<string, (...args: any) => any>} methods
 * @param {Record<string, (...args: any) => any>} slots
 */
const toVNode = (node, methods, slots) => {
    switch (node.type) {
        case "Element": {
            const attributes = node.attributes.reduce((attr, o) => {
                if (o.name.startsWith("on:")) {
                    const n = o.name.slice(3);
                    attr[`on${n[0].toUpperCase()}${n.slice(1)}`] =
                        methods?.[o.value];
                } else {
                    attr[o.name] = o.value;
                }
                return attr;
            }, {});

            const children = node.children.map((child) =>
                toVNode(child, methods, slots)
            );

            if (/^[A-Z]/.test(node.name)) {
                const component = components.get(node.name);

                if (!component)
                    return vue.h(
                        vue.Suspense,
                        vue.h(
                            vue.defineAsyncComponent({
                                loader: async () => {
                                    await new Promise((res) =>
                                        setTimeout(res, 2000)
                                    );
                                    // throw new Error("oops");

                                    return () =>
                                        vue.h(
                                            "marquee",
                                            `"${node.name}" component from backend...`
                                        );
                                },
                            })
                        )
                    );

                return vue.h(component, attributes, {
                    default: () => children,
                });
            }

            if (node.name === "slot") {
                return vue.h(slots.default);
            }

            return vue.h(node.name, attributes, children);
        }

        case "Text": {
            return node.value;
        }
    }
};

/**
 * @param {{
 *  id: string;
 *  template: string;
 *  props: any;
 *  emits: string[];
 *  instantiate: (props: any, emit: (event: string, ...args: any[]) => void) => any;
 * }} args
 */
export function defineComponent({
    id,
    template: twigData,
    instantiate = () => {},
    props,
    emits,
}) {
    const template = twig({ data: twigData });
    const component = vue.defineComponent({
        props,
        emits,

        data: (vm) => ({ ...vm.$props }),

        setup(_, { emit, slots }) {
            let instance;

            return (...args) => {
                const props = args[4];
                const html = template.render(props);
                const ast = parseHtml(html);

                instance = instance ?? instantiate(props, emit) ?? {};

                return vue.h(
                    vue.Fragment,
                    ast.html.fragments.map((node) =>
                        toVNode(node, instance, slots)
                    )
                );
            };
        },
    });

    components.set(id, component);

    return component;
}
