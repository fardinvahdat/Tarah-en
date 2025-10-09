import { defineStore } from "pinia";

interface menuOption {
  route: string;
  icon: string;
  title: string;
}
interface Menu {
  [index: number]: menuOption;
}
interface StoreState {
  menuOptions: Menu;
}

export const useMenuStore = defineStore("menu", {
  state: (): StoreState => ({
    menu: [],
  }),
  getters: {
    menuOptions() {
      return this.menu;
    },
  },
  actions: {
    updateMenu(isEditor: boolean) {
      if (isEditor) {
        this.menu = [
          {
            name: "editor",
            icon: "editor",
            title: "Design",
          },
          {
            name: "background",
            icon: "toolbar-menu-background",
            title: "Bg",
          },
          {
            name: "material",
            icon: "material",
            title: "Material",
          },
          // {
          //   name: "template",
          //   icon: "template",
          //   title: "Mold",
          // },
          {
            name: "toolkit",
            icon: "apps",
            title: "Tool",
          },
          // {
          //   name: "image",
          //   icon: "apps",
          //   title: "تصاویر",
          // },
        ];
      } else {
        this.menu = [
          {
            route: "/home",
            icon: "home-1",
            title: "Home",
          },
        ];
      }
    },
  },
});
