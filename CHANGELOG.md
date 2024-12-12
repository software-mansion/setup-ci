# [0.7.0](https://github.com/software-mansion/setup-ci/compare/v0.6.0...v0.7.0) (2024-12-12)


### Bug Fixes

* allign docs with SWM branding ([#127](https://github.com/software-mansion/setup-ci/issues/127)) ([aa23d68](https://github.com/software-mansion/setup-ci/commit/aa23d68e4725253fba336a7ecdf64622654bb1dd))
* do not install @react-native/eslint-config if lint configured with expo ([#131](https://github.com/software-mansion/setup-ci/issues/131)) ([bd3d37e](https://github.com/software-mansion/setup-ci/commit/bd3d37e184228a17e5542038e2e997e682453910))


### Features

* add pnpm support ([#137](https://github.com/software-mansion/setup-ci/issues/137)) ([3ece6e1](https://github.com/software-mansion/setup-ci/commit/3ece6e1139f39f87b7bec86ca81ba5551da8fd05))
* create expo specific config for lint in expo projects ([#135](https://github.com/software-mansion/setup-ci/issues/135)) ([fd78233](https://github.com/software-mansion/setup-ci/commit/fd78233f5760b78f58be3f51f24555ada0736092))
* stop using prebuild in eas preview recipe ([#139](https://github.com/software-mansion/setup-ci/issues/139)) ([2fd1d1b](https://github.com/software-mansion/setup-ci/commit/2fd1d1b2e736a53991896a7845a79f0028bf6e0a))
* support bun ([#133](https://github.com/software-mansion/setup-ci/issues/133)) ([98fe22d](https://github.com/software-mansion/setup-ci/commit/98fe22d86fd0030952b182a24ac1f33bb02f7cc9))



# [0.6.0](https://github.com/software-mansion/setup-ci/compare/v0.5.0...v0.6.0) (2024-10-07)


### Features

* add telemetry ([#123](https://github.com/software-mansion/setup-ci/issues/123)) ([6ed7dbe](https://github.com/software-mansion/setup-ci/commit/6ed7dbeecbd3ab66c299dcc935757091554053a3))



# [0.5.0](https://github.com/software-mansion/setup-ci/compare/v0.4.10...v0.5.0) (2024-09-23)


### Bug Fixes

* adjust example maestro flow in expo projects ([#113](https://github.com/software-mansion/setup-ci/issues/113)) ([ded3deb](https://github.com/software-mansion/setup-ci/commit/ded3debd6eed73173ea3509ada31cdd6ae8c0ca6))
* build dev script after name migration ([#108](https://github.com/software-mansion/setup-ci/issues/108)) ([08197f0](https://github.com/software-mansion/setup-ci/commit/08197f0dd0cee124cc8502e470184f6a7f039115))
* do not print generic error message for expected errors ([#110](https://github.com/software-mansion/setup-ci/issues/110)) ([46e637e](https://github.com/software-mansion/setup-ci/commit/46e637e75fe480bc212e665169b8b9975ce228e8))
* install typescript in eslint recipe ([#97](https://github.com/software-mansion/setup-ci/issues/97)) ([8214e49](https://github.com/software-mansion/setup-ci/commit/8214e49e2ecc7c97115bb8e6817be32b60b01d72))
* ios app name resolution on linux ([#118](https://github.com/software-mansion/setup-ci/issues/118)) ([1770bb4](https://github.com/software-mansion/setup-ci/commit/1770bb4dbcce4fdf61f67f98ab58d94f2ca70a42))
* publish-dev.yml syntax error ([#104](https://github.com/software-mansion/setup-ci/issues/104)) ([3eaf37e](https://github.com/software-mansion/setup-ci/commit/3eaf37e28a8bfb390ecf8b609c09051e62b3d345))
* release workflow syntax error ([#103](https://github.com/software-mansion/setup-ci/issues/103)) ([c15212d](https://github.com/software-mansion/setup-ci/commit/c15212d471ea2f5f2d242fc84520f28e9d3024eb))
* rename react-native-ci-cli to setup-ci after migration ([#100](https://github.com/software-mansion/setup-ci/issues/100)) ([b15de42](https://github.com/software-mansion/setup-ci/commit/b15de422fe4e2d47b063d36e99c937d2fa5a00b1))
* subprocess flaky input ([#117](https://github.com/software-mansion/setup-ci/issues/117)) ([e8505d4](https://github.com/software-mansion/setup-ci/commit/e8505d49b40c64575ad9a6f7c21b75119d2f6c2b))
* use node version file in maestro and debug build workflows ([#105](https://github.com/software-mansion/setup-ci/issues/105)) ([887292d](https://github.com/software-mansion/setup-ci/commit/887292dbc03afdda8949e6fc773035d6bb17ba66))


### Features

* add basic integration tests ([#13](https://github.com/software-mansion/setup-ci/issues/13)) ([d35c96c](https://github.com/software-mansion/setup-ci/commit/d35c96c4a8efe015b13d7407f4456330f7219abf))
* add Maestro recipe ([#92](https://github.com/software-mansion/setup-ci/issues/92)) ([4a125e7](https://github.com/software-mansion/setup-ci/commit/4a125e72208c8a9f836ac9e53b8dcbaeb0765833))
* build debug app on push to main ([#107](https://github.com/software-mansion/setup-ci/issues/107)) ([9e44472](https://github.com/software-mansion/setup-ci/commit/9e444726e9c4506c7bd9cdf75d19c8d36a735564))
* cache dependencies between workflows ([#94](https://github.com/software-mansion/setup-ci/issues/94)) ([74b42dd](https://github.com/software-mansion/setup-ci/commit/74b42dd20e45c274069f007177a72d01de40b9e1))
* change survey to multiselect ([#53](https://github.com/software-mansion/setup-ci/issues/53)) ([e5709aa](https://github.com/software-mansion/setup-ci/commit/e5709aab55895f57c7705936e7dd24667e2bab2b))
* improve EAS Update workflow to build dev client when fingerprint changes ([#90](https://github.com/software-mansion/setup-ci/issues/90)) ([12743c0](https://github.com/software-mansion/setup-ci/commit/12743c0ae5e7cf7e56be497a228df547577b51e6))
* run prettier formatting on modified files ([#96](https://github.com/software-mansion/setup-ci/issues/96)) ([fabb744](https://github.com/software-mansion/setup-ci/commit/fabb744c3becfb05c1f3f7de94c5980f1ea2beae))



## [0.4.10](https://github.com/software-mansion/setup-ci/compare/v0.4.9...v0.4.10) (2024-08-27)


### Bug Fixes

* add credits and spell check ([#84](https://github.com/software-mansion/setup-ci/issues/84)) ([91a00e2](https://github.com/software-mansion/setup-ci/commit/91a00e2a24207ce7535acdb2bbd9d542d9d41479))



## [0.4.9](https://github.com/software-mansion/setup-ci/compare/v0.4.8...v0.4.9) (2024-08-27)


### Bug Fixes

* add contents read permissions to detox workflows ([#83](https://github.com/software-mansion/setup-ci/issues/83)) ([f6ab340](https://github.com/software-mansion/setup-ci/commit/f6ab340ef66cda33727044e700c05a19f6ba2af9))



