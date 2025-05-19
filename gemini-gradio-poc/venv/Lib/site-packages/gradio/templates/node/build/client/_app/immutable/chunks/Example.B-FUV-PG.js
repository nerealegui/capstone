import { SvelteComponent, init, safe_not_equal, element, space, claim_element, children, claim_space, detach, src_url_equal, attr, toggle_class, insert_hydration, append_hydration, noop } from "../../../svelte/svelte.js";
import "../../../svelte/svelte-submodules.js";
function create_fragment(ctx) {
  let div;
  let img0;
  let img0_src_value;
  let t0;
  let img1;
  let img1_src_value;
  let t1;
  let span;
  return {
    c() {
      div = element("div");
      img0 = element("img");
      t0 = space();
      img1 = element("img");
      t1 = space();
      span = element("span");
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      img0 = claim_element(div_nodes, "IMG", { src: true, class: true });
      t0 = claim_space(div_nodes);
      img1 = claim_element(div_nodes, "IMG", { src: true, class: true });
      t1 = claim_space(div_nodes);
      span = claim_element(div_nodes, "SPAN", { class: true });
      children(span).forEach(detach);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      if (!src_url_equal(img0.src, img0_src_value = /*samples_dir*/
      ctx[1] + /*value*/
      ctx[0][0]))
        attr(img0, "src", img0_src_value);
      attr(img0, "class", "svelte-11djrz8");
      if (!src_url_equal(img1.src, img1_src_value = /*samples_dir*/
      ctx[1] + /*value*/
      ctx[0][1]))
        attr(img1, "src", img1_src_value);
      attr(img1, "class", "svelte-11djrz8");
      attr(span, "class", "svelte-11djrz8");
      attr(div, "class", "wrap svelte-11djrz8");
      toggle_class(
        div,
        "table",
        /*type*/
        ctx[2] === "table"
      );
      toggle_class(
        div,
        "gallery",
        /*type*/
        ctx[2] === "gallery"
      );
      toggle_class(
        div,
        "selected",
        /*selected*/
        ctx[3]
      );
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, img0);
      append_hydration(div, t0);
      append_hydration(div, img1);
      append_hydration(div, t1);
      append_hydration(div, span);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*samples_dir, value*/
      3 && !src_url_equal(img0.src, img0_src_value = /*samples_dir*/
      ctx2[1] + /*value*/
      ctx2[0][0])) {
        attr(img0, "src", img0_src_value);
      }
      if (dirty & /*samples_dir, value*/
      3 && !src_url_equal(img1.src, img1_src_value = /*samples_dir*/
      ctx2[1] + /*value*/
      ctx2[0][1])) {
        attr(img1, "src", img1_src_value);
      }
      if (dirty & /*type*/
      4) {
        toggle_class(
          div,
          "table",
          /*type*/
          ctx2[2] === "table"
        );
      }
      if (dirty & /*type*/
      4) {
        toggle_class(
          div,
          "gallery",
          /*type*/
          ctx2[2] === "gallery"
        );
      }
      if (dirty & /*selected*/
      8) {
        toggle_class(
          div,
          "selected",
          /*selected*/
          ctx2[3]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { value } = $$props;
  let { samples_dir } = $$props;
  let { type } = $$props;
  let { selected = false } = $$props;
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("samples_dir" in $$props2)
      $$invalidate(1, samples_dir = $$props2.samples_dir);
    if ("type" in $$props2)
      $$invalidate(2, type = $$props2.type);
    if ("selected" in $$props2)
      $$invalidate(3, selected = $$props2.selected);
  };
  return [value, samples_dir, type, selected];
}
class Example extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      value: 0,
      samples_dir: 1,
      type: 2,
      selected: 3
    });
  }
}
export {
  Example as default
};
