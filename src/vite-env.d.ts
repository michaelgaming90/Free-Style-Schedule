/// <reference types="/Free-Style-Schedule/vite/client"/>

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
