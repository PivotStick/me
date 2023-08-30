/**
 * @param {HTMLElement} parent
 * @param {{ counter: number }} props
 * @param {() => void} invalidate
 */
export default function (parent, props, invalidate) {
    return {
        increment() {
            props.counter++;
            invalidate();
        },
        decrement() {
            props.counter--;
            invalidate();
        },
    };
}
