import hljs from 'highlight.js';
import type {LanguageFn} from 'highlight.js';

type NamedLanguage = LanguageFn & {name: string};
export type LanguageRegistration = NamedLanguage | [string, LanguageFn];

/**
 * All highlight.js languages are registered by default via the bundled build.
 * The constant is kept for backwards compatibility with previous exports.
 */
export const DEFAULT_LANGUAGES: LanguageRegistration[] = [];

/**
 * Registers a language on the shared highlight.js instance if it has not already been added.
 */
export const registerLanguage = (name: string, language: LanguageFn): typeof hljs => {
        if (!hljs.getLanguage(name)) {
                hljs.registerLanguage(name, language);
        }

        return hljs;
};

const resolveLanguageRegistration = (registration: LanguageRegistration): [string, LanguageFn] | undefined => {
        if (Array.isArray(registration)) {
                return registration;
        }

        const {name} = registration;

        if (!name) {
                return undefined;
        }

        return [name, registration];
};

/**
 * Registers the provided languages on the shared highlight.js instance.
 *
 * Consumers can call this multiple times to progressively add support for
 * additional languages (for instance, `configureHighlight([["csharp", csharp]])`).
 */
export const configureHighlight = (languages: LanguageRegistration[] = []): typeof hljs => {
        languages.forEach((language) => {
                const registration = resolveLanguageRegistration(language);
                if (!registration) {
                        return;
                }

                const [name, definition] = registration;

                registerLanguage(name, definition);
        });

        return hljs;
};

export default hljs;
