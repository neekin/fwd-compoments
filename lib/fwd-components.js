import { onMounted as t } from "vue";
const n = {
  __name: "work-flow",
  props: {},
  setup(o) {
    return t(() => {
      console.log("组件挂在成功");
    }), () => {
    };
  }
};
n.install = (o) => {
  o.component(n.__name, n);
};
const e = [n], a = (o) => {
  e.forEach((s) => {
    o.components(s.__name, s);
  });
}, p = {
  install: a
};
export {
  n as WorkFlow,
  p as default
};
