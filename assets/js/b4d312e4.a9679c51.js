"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[616],{5680:(e,l,i)=>{i.d(l,{xA:()=>s,yg:()=>y});var r=i(6540);function t(e,l,i){return l in e?Object.defineProperty(e,l,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[l]=i,e}function n(e,l){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);l&&(r=r.filter((function(l){return Object.getOwnPropertyDescriptor(e,l).enumerable}))),i.push.apply(i,r)}return i}function o(e){for(var l=1;l<arguments.length;l++){var i=null!=arguments[l]?arguments[l]:{};l%2?n(Object(i),!0).forEach((function(l){t(e,l,i[l])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):n(Object(i)).forEach((function(l){Object.defineProperty(e,l,Object.getOwnPropertyDescriptor(i,l))}))}return e}function a(e,l){if(null==e)return{};var i,r,t=function(e,l){if(null==e)return{};var i,r,t={},n=Object.keys(e);for(r=0;r<n.length;r++)i=n[r],l.indexOf(i)>=0||(t[i]=e[i]);return t}(e,l);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(r=0;r<n.length;r++)i=n[r],l.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(t[i]=e[i])}return t}var d=r.createContext({}),u=function(e){var l=r.useContext(d),i=l;return e&&(i="function"==typeof e?e(l):o(o({},l),e)),i},s=function(e){var l=u(e.components);return r.createElement(d.Provider,{value:l},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var l=e.children;return r.createElement(r.Fragment,{},l)}},g=r.forwardRef((function(e,l){var i=e.components,t=e.mdxType,n=e.originalType,d=e.parentName,s=a(e,["components","mdxType","originalType","parentName"]),p=u(i),g=t,y=p["".concat(d,".").concat(g)]||p[g]||c[g]||n;return i?r.createElement(y,o(o({ref:l},s),{},{components:i})):r.createElement(y,o({ref:l},s))}));function y(e,l){var i=arguments,t=l&&l.mdxType;if("string"==typeof e||t){var n=i.length,o=new Array(n);o[0]=g;var a={};for(var d in l)hasOwnProperty.call(l,d)&&(a[d]=l[d]);a.originalType=e,a[p]="string"==typeof e?e:t,o[1]=a;for(var u=2;u<n;u++)o[u]=i[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,i)}g.displayName="MDXCreateElement"},1292:(e,l,i)=>{i.r(l),i.d(l,{assets:()=>d,contentTitle:()=>o,default:()=>c,frontMatter:()=>n,metadata:()=>a,toc:()=>u});var r=i(8168),t=(i(6540),i(5680));const n={sidebar_position:1},o="Release build",a={unversionedId:"aux-workflows/build-release",id:"aux-workflows/build-release",title:"Release build",description:"Workflow that build the app in release mode for Android and iOS.",source:"@site/docs/aux-workflows/build-release.mdx",sourceDirName:"aux-workflows",slug:"/aux-workflows/build-release",permalink:"/setup-ci/docs/aux-workflows/build-release",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Auxiliary Workflows",permalink:"/setup-ci/docs/category/auxiliary-workflows"},next:{title:"Debug build",permalink:"/setup-ci/docs/aux-workflows/build-debug"}},d={},u=[{value:"Usage",id:"usage",level:2},{value:"Detailed behavior",id:"detailed-behavior",level:2},{value:"Caching",id:"caching",level:3},{value:"Modified and created files",id:"modified-and-created-files",level:3},{value:"Workflow details",id:"workflow-details",level:3},{value:"build-release-android",id:"build-release-android",level:4},{value:"build-release-ios",id:"build-release-ios",level:4}],s={toc:u},p="wrapper";function c(e){let{components:l,...i}=e;return(0,t.yg)(p,(0,r.A)({},s,i,{components:l,mdxType:"MDXLayout"}),(0,t.yg)("h1",{id:"release-build"},"Release build"),(0,t.yg)("p",null,"Workflow that build the app in release mode for Android and iOS."),(0,t.yg)("p",null,"This workflow can be triggered by other workflows depending on it."),(0,t.yg)("h2",{id:"usage"},"Usage"),(0,t.yg)("p",null,"This workflow cannot be explicitly specified to be generated using SCI. It will be generated automatically\nif you choose to create workflow depending on it."),(0,t.yg)("h2",{id:"detailed-behavior"},"Detailed behavior"),(0,t.yg)("p",null,"Below you can find detailed information about what the script does with your project when generating Release Build workflow."),(0,t.yg)("h3",{id:"caching"},"Caching"),(0,t.yg)("p",null,"Built apps will be cached using ",(0,t.yg)("a",{parentName:"p",href:"https://github.com/actions/cache"},"actions/cache")," using keys\n",(0,t.yg)("inlineCode",{parentName:"p"},"android-release-build-${{ github.event.pull_request.head.sha }}")," and\n",(0,t.yg)("inlineCode",{parentName:"p"},"ios-release-build-${{ github.event.pull_request.head.sha }}"),"."),(0,t.yg)("p",null,(0,t.yg)("inlineCode",{parentName:"p"},"${{ github.event.pull_request.head.sha }}")," will evaluate to SHA of last commit on feature branch in Pull Request."),(0,t.yg)("p",null,"Note that the objective of this caching mechanism is not to optimize and reuse builds (this is only\npossible with debug builds), but rather to allow retrieving built app in other workflows."),(0,t.yg)("h3",{id:"modified-and-created-files"},"Modified and created files"),(0,t.yg)("table",null,(0,t.yg)("tr",null,(0,t.yg)("th",{style:{width:"40%"}},"File"),(0,t.yg)("th",null,"Changes")),(0,t.yg)("tr",null,(0,t.yg)("td",null,(0,t.yg)("code",null,".github/workflows/build-release-android.yml")),(0,t.yg)("td",null,"Contains the CI workflow for building release Android app")),(0,t.yg)("tr",null,(0,t.yg)("td",null,(0,t.yg)("code",null,".github/workflows/build-release-ios.yml")),(0,t.yg)("td",null,"Contains the CI workflow for building release iOS app")),(0,t.yg)("tr",null,(0,t.yg)("td",null,(0,t.yg)("code",null,"package.json")),(0,t.yg)("td",null,(0,t.yg)("ul",null,(0,t.yg)("li",null,"New script:",(0,t.yg)("code",null,"build:release:android: npx expo prebuild && cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release -Dorg.gradle.jvmargs=-Xmx4g"),(0,t.yg)("br",null),"(",(0,t.yg)("code",null,"npx expo prebuild")," is ommited in non-Expo projects)"),(0,t.yg)("li",null,"New script:",(0,t.yg)("code",null,"build:release:ios: npx expo prebuild && xcodebuild ONLY_ACTIVE_ARCH=YES -workspace ios/[iOSAppName].xcworkspace -UseNewBuildSystem=YES -scheme [iOSAppName] -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -quiet"),(0,t.yg)("br",null),"(",(0,t.yg)("code",null,"npx expo prebuild")," is replaced with ",(0,t.yg)("code",null,"cd ios && pod install && cd..")," in non-Expo projects)",(0,t.yg)("br",null),"(",(0,t.yg)("code",null,"[iOSAppName]")," is replaced with the name of the iOS app retrieved from native code)")))),(0,t.yg)("tr",null,(0,t.yg)("td",null,(0,t.yg)("code",null,"app.json")),(0,t.yg)("td",null,"Fields ",(0,t.yg)("code",null,"expo.android.package")," and ",(0,t.yg)("code",null,"expo.ios.bundleIdentifier")," will be created in Expo projects if not detected (they are needed for ",(0,t.yg)("code",null,"npx expo prebuild"),")"))),(0,t.yg)("h3",{id:"workflow-details"},"Workflow details"),(0,t.yg)("h4",{id:"build-release-android"},"build-release-android"),(0,t.yg)("p",null,"The following diagram represents the flow of the ",(0,t.yg)("inlineCode",{parentName:"p"},"build-release-android")," workflow:"),(0,t.yg)("mermaid",{value:'flowchart TD;\n    A["\ud83d\udcbe Maximize build space\\nUsing <a href=\'https://github.com/AdityaGarg8/remove-unwanted-software\'>AdityaGarg8/remove-unwanted-software</a>"]--\x3eB["\ud83c\udf3f Setup Node"];\n    B--\x3eC["\ud83d\udce6 Install dependencies"];\n    C--\x3eD["\u2615 Setup JDK 17"]\n    D--\x3eE["\ud83d\udc18 Setup Gradle 8.8"]\n    E--\x3eF["\ud83d\udee0\ufe0f Build [yarn build:release:android]"]\n    F--\x3eG["\ud83d\udce1 Store built app in cache"]'}),(0,t.yg)("h4",{id:"build-release-ios"},"build-release-ios"),(0,t.yg)("p",null,"The following diagram represents the flow of the ",(0,t.yg)("inlineCode",{parentName:"p"},"build-release-ios")," workflow:"),(0,t.yg)("mermaid",{value:'flowchart TD;\n    A["\ud83c\udf3f Setup Node"]--\x3eB["\ud83d\udce6 Install dependencies"];\n    B--\x3eC["\ud83d\udd28 Use latest stable Xcode"]\n    C--\x3eD["\ud83d\udee0\ufe0f Build [yarn build:release:ios]"]\n    D--\x3eE["\ud83d\udce1 Store built app in cache"]'}))}c.isMDXComponent=!0}}]);