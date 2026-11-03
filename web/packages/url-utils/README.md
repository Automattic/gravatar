# Gravatar Url Utils

A set of utility function to generate Gravatar Avatar or Profile URLs.

## Quickstart

### Install with npm

Add the package to your project:

```sh
npm install --save @gravatar-com/url-utils
```

### Install with UNPKG

For Vanilla JavaScript, import the library as shown below:

```html
<!-- Import the url-utils library -->
<script src="https://unpkg.com/@gravatar-com/url-utils@x.x.x" defer></script>

<script>
  // The library is accessible as a global variable "GravatarUrlUtils"
	console.log( GravatarUrlUtils.avatarUrl('example@example.com') );
</script>
```

### Usage

```js
import { avatarUrl, profileUrl } from '@gravatar-com/url-utils';

avatarUrl( 'sara@example.com', { size: 500 } );
// https://www.gravatar.com/avatar/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a?size=500

profileUrl( 'sara@example.com' );
// https://www.gravatar.com/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a
```

### Documentation

#### `avatarUrl`

Generates a Gravatar avatar URL for the given email.

##### Parameters

-   `email` (string): The email address for which to generate the avatar URL.
-   `options` (GravatarAvatarOptions): Optional settings for the avatar URL.
    -   `size` (number): The size of the avatar in pixels.
    -   `default` (string): The default image to use if no Gravatar is found.
    -   `rating` (string): The rating of the avatar (e.g., `g`, `pg`, `r`, `x`).
    -   `forcedefault` (boolean): Force the default image to always load.

##### Returns

-   (string): The generated Gravatar avatar URL.

##### Example

```ts
avatarUrl( 'sara@example.com' );
// https://www.gravatar.com/avatar/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a

avatarUrl( 'sara@example.com', { size: 500 } );
// https://www.gravatar.com/avatar/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a?size=500

avatarUrl( 'sara@example.com', { size: 500, default: GravatarDefault.Robohash } );
// https://www.gravatar.com/avatar/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a?size=500&default=robohash

avatarUrl( 'sara@example.com', { size: 500, default: 'robohash' } );
// https://www.gravatar.com/avatar/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a?size=500&default=robohash
```

#### `profileUrl`

Generates a Gravatar profile URL for the given email.

##### Parameters

-   `email` (string): The email address for which to generate the profile URL.
-   `format` (GravatarFormat): The format of the profile data. Defaults to `GravatarFormat.HTML`,
    -   `GravatarFormat.HTML`: Returns the profile in HTML format.
    -   `GravatarFormat.JSON`: Returns the profile in JSON format.
    -   `GravatarFormat.XML`: Returns the profile in XML format.
    -   `GravatarFormat.QR`: Returns the profile as a QR code.
    -   `GravatarFormat.VCF`: Returns the profile as a VCF file.

##### Returns

-   (string): The generated Gravatar profile URL. HTML returns the link to the user's profile, while JSON, XML, and QR return the profile data in the specified format.

##### Example

```ts
profileUrl( 'sara@example.com' );
// https://www.gravatar.com/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a

profileUrl( 'sara@example.com', GravatarFormat.QR );
// https://www.gravatar.com/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a.qr

profileUrl( 'sara@example.com', 'qr');
// https://www.gravatar.com/259b65833bbadfd58ee66dde290489a6e51518339de4886d2331027751f0913a.qr
```

Check out the [unit tests if you want to see more examples](tests/index.test.ts).

### Example React component

Example use with a React component:

```typescript
import { avatarUrl } from '@gravatar-com/url-utils';

interface GravatarProps {
	email: string;
	size?: number;
}

const Gravatar = ( { email, size }: GravatarProps ) => {
	return (
		<img
			src={ avatarUrl( email, size ? { size: size } : null ) }
			alt="User Avatar"
			width={ size }
			height={ size }
		/>
	);
};

export default Gravatar;
```

Use it like this:

```html
<Gravatar email="sara@example.com" />
<Gravatar email="sara@example.com" size={500} />
```

### Methods

```js
avatarUrl(email, options: GravatarOptions)
```

```js
profileUrl(email, format: GravatarFormat)
```

## Contribute

Project directory structure:

```sh
.
├── README.md               # You are here
├── dist                    # Output files (js and types)
├── lint-staged.config.js
├── package.json
├── src                     # Code
│   ├── cli.ts              # Very basic cli tool
│   └── index.ts            # The main library
├── tests                   # Unit tests, you should proabaly start here
│   └── index.test.ts
├── webpack                 # Webpack config
├── tsconfig.json           # TypeScript config (type-checking, tests)
├── tsconfig.build.json     # TypeScript config for emitting type declarations
└── babel.config.js
```

### Build

Build the Javascript files from Typescript:

```sh
npm run build
```

Then you can run the command line tool:

```sh
node dist/cli.js --avatar sara@example.com
node dist/cli.js --profile sara@example.com
```

### Run tests

```sh
npm run test
```

## License

Gravatar Hovercards is licensed under [GNU General Public License v2 (or later)](../../../docs/LICENSE.md).
