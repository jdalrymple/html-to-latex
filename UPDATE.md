# Upgrade to Version 1

- Updating all dependencies
- Updating README
- Adding Typesaftey
- Merging additional functionality as tests from @
- Switching from Swyac for CLI functionality

## Moving From SWYAC

Swyac hasnt been maintained in over four years. Since were doing a full update of this library, now would be the best time to update this dep or replace it. Since its been lacking updates, I've been looking at alternatives that priortize 1. Easy of refactor 2. Maintenance 3. Size. I focused on these items since the CLI isnt very complicated and thus doesnt require any fancy support. Also, since type saftey was added to this library, an additional item that should be supported is 4. typing, and finally planning for the future, 5. ESM readiness.

### Alternatives

#### Swyac (for reference)

- Website: https://sywac.io/
- GH: https://github.com/sywac/sywac
- NPM: https://www.npmjs.com/package/sywac
- Latest Version: 1.3.0
- Last Release: March 29 2020
- Install Size: 103kB
- Package Size: 103kB

#### @oclif

- Website: https://oclif.io
- GH: github.com/oclif/core
- NPM: https://www.npmjs.com/package/@oclif/core
- Latest Version: 3.18.2
- Last Release: Feb 1 2024
- Install Size: 7.82Mb
- Package Size: 406kB

**PROs:**

- very mature
- supports everything under the sun
- has support for ESM and Typescript

**CONs:**

- Significantly more complex than what I need
- Requires a large rewrite to handle the structure for commands (doesnt support Fluid syntax)

#### commander

- GH: https://github.com/tj/commander.js
- NPM: https://www.npmjs.com/package/commander
- Latest Version: 12.0.0
- Last Release: Feb 3 2024
- Install Size: 177kB
- Package Size: 177kB

**PROs:**

- very mature
- well maintained

**CONs:**

#### @molt/command

- GH: https://github.com/jasonkuhrt/molt
- NPM: https://www.npmjs.com/package/@molt/command
- Latest Version: 0.9.0
- Last Release: Sept 23 2023
- Install Size: 3.38Mb (Looks like src files are also included which would add to this size)
- Package Size: 1.11Mb

**PROs:**

- very good type safety
- beautiful cli output
- supports ESM and Typescript
- support Fluid syntax

**CONs:**

- very new
- hasnt been worked on for over 6 months
- Quite extensive support for funcitonality that isnt needed here

#### cac

- GH: hhttps://github.com/cacjs/cac
- NPM: https://github.com/cacjs/cac?tab=readme-ov-file
- Latest Version: 6.7.14
- Last Release: Aug 28 2022
- Install Size: 79.9Kb
- Package Size: 79.9kB

**PROs:**

- Mature
- supports ESM and Typescript
- support Fluid syntax
- Simple API

**CONs:**

- Hasnt been touched in 2 years
- Requires embedding types into a string format

#### breadc => similar to cac

- Website: https://breadc.onekuma.cn/
- GH: https://github.com/yjl9903/Breadc
- Latest Version: 0.9.7
- Last Release: Oct 18 2023
- Install Size: 106kB
- Package Size: 84.0kB

**PROs:**

- supports ESM and Typescript
- support Fluid syntax
- Simple API

**CONs:**

- Pretty new
- Hasnt been touched in 5 months
- Requires embedding types into a string format

#### carporal

- Website: https://caporal.io/
- GH: https://github.com/mattallty/Caporal.js
- Latest Version: 3.0.0
- Last Release: Aug 23 2023
- Install Size: 14.9MB
- Package Size: 97.0kB

**PROs:**

- supports ESM and Typescript
- support Fluid syntax
- Simple API
- Supports validation

**CONs:**

- Hasnt been touched in 6 months

#### bandersnatch

- GH: https://github.com/hongaar/bandersnatch
- NPM: https://www.npmjs.com/package/bandersnatch
- Latest Version: 1.12.13
- Last Release: Nov 27 2023
- Install Size: 5.38MB
- Package Size: 119kB

**PROs:**

- Validation
- Simple API
- supports ESM and Typescript
- support Fluid syntax

**CONs:**

**Notes:**
Looks to be build off yargs
