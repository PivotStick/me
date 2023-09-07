/**
 * @param {string} content
 */
export const parseHtml = (content) => {
    let i = 0;

    /**
     * @type {{ html: { fragments: any[] }}}
     */
    const ast = { html: {} };

    ast.html.fragments = parseFragments(() => i < content.length);

    return ast;

    function parseFragments(condition) {
        const fragments = [];

        while (condition()) {
            const fragment = parseFragment();
            if (fragment) {
                fragments.push(fragment);
            }
        }

        return fragments;
    }
    function parseFragment() {
        return parseElement() || parseText();
    }
    function parseElement() {
        if (match("<")) {
            eat("<");
            const tagName = read(/[\w\d-]/);
            skipWhitespaces();
            let attributes = [];
            let children = [];

            if (!match("/")) {
                const endTagName = `</${tagName}>`;
                attributes = parseAttributeList();
                children = parseFragments(
                    () => !match(endTagName) && i < content.length
                );
                eat(endTagName);
            } else {
                eat("/");
                skipWhitespaces();
                eat(">");
            }

            return {
                type: "Element",
                name: tagName,
                attributes,
                children,
            };
        }
    }
    function parseText() {
        const text = read(/[^<]/);

        if (text.trim()) {
            return {
                type: "Text",
                value: text,
            };
        }
    }
    function parseAttributeList() {
        const attributes = [];
        skipWhitespaces();

        while (!match(">") && i < content.length) {
            attributes.push(parseAttribute());
            skipWhitespaces();
        }

        eat(">");
        return attributes;
    }
    function parseAttribute() {
        const name = read(/[^\s\n=]/);
        let value = true;

        if (match("=")) {
            eat('="');
            value = read(/[^"]/);
            eat('"');
        }

        return {
            type: "Attribute",
            name,
            value,
        };
    }

    // --

    /**
     * @param {string | RegExp} pattern
     */
    function match(pattern) {
        if (typeof pattern === "string") {
            return content.slice(i, i + pattern.length) === pattern;
        } else {
            return pattern.test(content.slice(i));
        }
    }

    function eat(str) {
        if (match(str)) {
            i += str.length;
        } else {
            throw new Error(`Expected ${str} at ${i}`);
        }
    }

    /**
     * @param {RegExp} regex
     */
    function read(regex) {
        const from = i;

        while (regex.test(content[i]) && i < content.length) {
            i++;
        }

        return content.slice(from, i);
    }

    function skipWhitespaces() {
        read(/[\s\n]/);
    }
};
