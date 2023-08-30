/**
 * @param {HTMLElement} container
 * @param {{ counter: number }} props
 * @param {() => void} invalidate
 */
export default function (container, props, invalidate) {
    return {
        onMount() {
            const button = container.querySelector("button");

            if (button) {
                button.addEventListener("click", () => {
                    props.counter++;
                    invalidate();
                });
            }
        },
    };
}
