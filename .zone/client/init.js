import routes from "./routes";
import Root from "./root.twig";

export const start = async ({ target, data }) => {
    let root;

    window.addEventListener("click", (e) => {
        if (e.target instanceof HTMLAnchorElement) {
            const url = new URL(e.target.href);
            if (
                e.target.target !== "_blank" &&
                url.origin === location.origin
            ) {
                e.preventDefault();
                goto(url.pathname);
            }
        }
    });

    const goto = async (pathname) => {
        for (const [regex, page, layout] of routes) {
            if (regex.test(pathname)) {
                const props = {
                    page: (await page()).default,
                    layout: layout ? (await layout()).default : undefined,
                    pageProps: data,
                };

                if (root) {
                    root.$set(props);
                } else {
                    root = new Root({
                        hydrate: true,
                        target,
                        props,
                    });
                }
                break;
            }
        }
    };

    await goto(location.pathname);
};
