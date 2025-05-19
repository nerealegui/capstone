var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SvelteComponent, init, safe_not_equal, create_slot, element, space, claim_element, children, detach, claim_space, get_svelte_dataset, attr, set_style, toggle_class, insert_hydration, append_hydration, listen, update_slot_base, get_all_dirty_from_scope, get_slot_changes, transition_in, transition_out, onMount, binding_callbacks, assign, set_attributes, get_spread_update, src_url_equal, noop, compute_rest_props, createEventDispatcher, tick, exclude_internal_props, create_component, empty, claim_component, mount_component, group_outros, check_outros, destroy_component, component_subscribe, bind, add_render_callback, add_iframe_resize_listener, add_flush_callback, flush, bubble, afterUpdate, get_spread_object } from "../../../svelte/svelte.js";
import { tweened } from "../../../svelte/svelte-submodules.js";
import { s as select } from "./select.DBwdIWW1.js";
import { d as dispatch } from "./dispatch.C88ITL0L.js";
import { r as resolve_wasm_src, I as IconButton, C as Clear, B as Block, S as Static } from "./2.D3x_Usqw.js";
import { B as BlockLabel } from "./BlockLabel.BXJT2Cer.js";
import { E as Empty } from "./Empty.DWA7FUv3.js";
import { D as Download } from "./Download.BLM_J5wv.js";
import { I as Image, F as FullscreenButton } from "./FullscreenButton.CK0qjvMf.js";
import { U as Undo } from "./Undo.BEjgqHJW.js";
import { I as IconButtonWrapper } from "./IconButtonWrapper.BzyBVmn5.js";
import { D as DownloadLink } from "./DownloadLink.DjXz4G9i.js";
import { a as Upload } from "./Upload.BUSIzYng.js";
import { U as UploadText } from "./UploadText.B515dsTl.js";
function sourceEvent(event) {
  let sourceEvent2;
  while (sourceEvent2 = event.sourceEvent)
    event = sourceEvent2;
  return event;
}
function pointer(event, node) {
  event = sourceEvent(event);
  if (node === void 0)
    node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}
const nonpassive = { passive: false };
const nonpassivecapture = { capture: true, passive: false };
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function dragDisable(view) {
  var root = view.document.documentElement, selection = select(view).on("dragstart.drag", noevent, nonpassivecapture);
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", noevent, nonpassivecapture);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root = view.document.documentElement, selection = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", noevent, nonpassivecapture);
    setTimeout(function() {
      selection.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}
const constant = (x) => () => x;
function DragEvent(type, {
  sourceEvent: sourceEvent2,
  subject,
  target,
  identifier,
  active,
  x,
  y,
  dx,
  dy,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent2, enumerable: true, configurable: true },
    subject: { value: subject, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    identifier: { value: identifier, enumerable: true, configurable: true },
    active: { value: active, enumerable: true, configurable: true },
    x: { value: x, enumerable: true, configurable: true },
    y: { value: y, enumerable: true, configurable: true },
    dx: { value: dx, enumerable: true, configurable: true },
    dy: { value: dy, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}
function defaultContainer() {
  return this.parentNode;
}
function defaultSubject(event, d) {
  return d == null ? { x: event.x, y: event.y } : d;
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function drag() {
  var filter = defaultFilter, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable, gestures = {}, listeners = dispatch("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
  function drag2(selection) {
    selection.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function mousedowned(event, d) {
    if (touchending || !filter.call(this, event, d))
      return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture)
      return;
    select(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
    dragDisable(event.view);
    nopropagation(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }
  function mousemoved(event) {
    noevent(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }
  function mouseupped(event) {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent(event);
    gestures.mouse("end", event);
  }
  function touchstarted(event, d) {
    if (!filter.call(this, event, d))
      return;
    var touches = event.changedTouches, c = container.call(this, event, d), n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
        nopropagation(event);
        gesture("start", event, touches[i]);
      }
    }
  }
  function touchmoved(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent(event);
        gesture("drag", event, touches[i]);
      }
    }
  }
  function touchended(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    if (touchending)
      clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, 500);
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation(event);
        gesture("end", event, touches[i]);
      }
    }
  }
  function beforestart(that, container2, event, d, identifier, touch) {
    var dispatch2 = listeners.copy(), p = pointer(touch || event, container2), dx, dy, s;
    if ((s = subject.call(that, new DragEvent("beforestart", {
      sourceEvent: event,
      target: drag2,
      identifier,
      active,
      x: p[0],
      y: p[1],
      dx: 0,
      dy: 0,
      dispatch: dispatch2
    }), d)) == null)
      return;
    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;
    return function gesture(type, event2, touch2) {
      var p0 = p, n;
      switch (type) {
        case "start":
          gestures[identifier] = gesture, n = active++;
          break;
        case "end":
          delete gestures[identifier], --active;
        case "drag":
          p = pointer(touch2 || event2, container2), n = active;
          break;
      }
      dispatch2.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event2,
          subject: s,
          target: drag2,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: dispatch2
        }),
        d
      );
    };
  }
  drag2.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), drag2) : filter;
  };
  drag2.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant(_), drag2) : container;
  };
  drag2.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant(_), drag2) : subject;
  };
  drag2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), drag2) : touchable;
  };
  drag2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag2 : value;
  };
  drag2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag2) : Math.sqrt(clickDistance2);
  };
  return drag2;
}
function create_fragment$6(ctx) {
  let div3;
  let div0;
  let t0;
  let div2;
  let span3;
  let span0;
  let textContent = "◢";
  let span1;
  let span2;
  let textContent_1 = "◢";
  let t3;
  let div1;
  let current;
  let mounted;
  let dispose;
  const default_slot_template = (
    /*#slots*/
    ctx[11].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[10],
    null
  );
  return {
    c() {
      div3 = element("div");
      div0 = element("div");
      if (default_slot)
        default_slot.c();
      t0 = space();
      div2 = element("div");
      span3 = element("span");
      span0 = element("span");
      span0.textContent = textContent;
      span1 = element("span");
      span2 = element("span");
      span2.textContent = textContent_1;
      t3 = space();
      div1 = element("div");
      this.h();
    },
    l(nodes) {
      div3 = claim_element(nodes, "DIV", { class: true, role: true });
      var div3_nodes = children(div3);
      div0 = claim_element(div3_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      if (default_slot)
        default_slot.l(div0_nodes);
      div0_nodes.forEach(detach);
      t0 = claim_space(div3_nodes);
      div2 = claim_element(div3_nodes, "DIV", { class: true, role: true, style: true });
      var div2_nodes = children(div2);
      span3 = claim_element(div2_nodes, "SPAN", { class: true });
      var span3_nodes = children(span3);
      span0 = claim_element(span3_nodes, "SPAN", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(span0) !== "svelte-9lsvah")
        span0.textContent = textContent;
      span1 = claim_element(span3_nodes, "SPAN", { class: true });
      children(span1).forEach(detach);
      span2 = claim_element(span3_nodes, "SPAN", { class: true, ["data-svelte-h"]: true });
      if (get_svelte_dataset(span2) !== "svelte-1lu38by")
        span2.textContent = textContent_1;
      span3_nodes.forEach(detach);
      t3 = claim_space(div2_nodes);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      children(div1).forEach(detach);
      div2_nodes.forEach(detach);
      div3_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "content svelte-fpmna9");
      attr(span0, "class", "icon left svelte-fpmna9");
      attr(span1, "class", "icon center svelte-fpmna9");
      set_style(
        span1,
        "--color",
        /*slider_color*/
        ctx[4]
      );
      attr(span2, "class", "icon right svelte-fpmna9");
      attr(span3, "class", "icon-wrap svelte-fpmna9");
      toggle_class(
        span3,
        "active",
        /*active*/
        ctx[7]
      );
      toggle_class(
        span3,
        "disabled",
        /*disabled*/
        ctx[3]
      );
      attr(div1, "class", "inner svelte-fpmna9");
      set_style(
        div1,
        "--color",
        /*slider_color*/
        ctx[4]
      );
      attr(div2, "class", "outer svelte-fpmna9");
      attr(div2, "role", "none");
      set_style(div2, "transform", "translateX(" + /*px*/
      ctx[6] + "px)");
      toggle_class(
        div2,
        "disabled",
        /*disabled*/
        ctx[3]
      );
      toggle_class(
        div2,
        "grab",
        /*active*/
        ctx[7]
      );
      attr(div3, "class", "wrap svelte-fpmna9");
      attr(div3, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, div3, anchor);
      append_hydration(div3, div0);
      if (default_slot) {
        default_slot.m(div0, null);
      }
      ctx[13](div0);
      append_hydration(div3, t0);
      append_hydration(div3, div2);
      append_hydration(div2, span3);
      append_hydration(span3, span0);
      append_hydration(span3, span1);
      append_hydration(span3, span2);
      append_hydration(div2, t3);
      append_hydration(div2, div1);
      ctx[14](div2);
      ctx[15](div3);
      current = true;
      if (!mounted) {
        dispose = listen(
          window,
          "resize",
          /*resize_handler*/
          ctx[12]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & /*$$scope*/
        1024)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[10],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[10]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[10],
              dirty,
              null
            ),
            null
          );
        }
      }
      if (dirty & /*slider_color*/
      16) {
        set_style(
          span1,
          "--color",
          /*slider_color*/
          ctx2[4]
        );
      }
      if (!current || dirty & /*active*/
      128) {
        toggle_class(
          span3,
          "active",
          /*active*/
          ctx2[7]
        );
      }
      if (!current || dirty & /*disabled*/
      8) {
        toggle_class(
          span3,
          "disabled",
          /*disabled*/
          ctx2[3]
        );
      }
      if (dirty & /*slider_color*/
      16) {
        set_style(
          div1,
          "--color",
          /*slider_color*/
          ctx2[4]
        );
      }
      if (!current || dirty & /*px*/
      64) {
        set_style(div2, "transform", "translateX(" + /*px*/
        ctx2[6] + "px)");
      }
      if (!current || dirty & /*disabled*/
      8) {
        toggle_class(
          div2,
          "disabled",
          /*disabled*/
          ctx2[3]
        );
      }
      if (!current || dirty & /*active*/
      128) {
        toggle_class(
          div2,
          "grab",
          /*active*/
          ctx2[7]
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      if (default_slot)
        default_slot.d(detaching);
      ctx[13](null);
      ctx[14](null);
      ctx[15](null);
      mounted = false;
      dispose();
    }
  };
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function round(n, points) {
  const mod = Math.pow(10, points);
  return Math.round((n + Number.EPSILON) * mod) / mod;
}
function instance$6($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { position = 0.5 } = $$props;
  let { disabled = false } = $$props;
  let { slider_color = "var(--border-color-primary)" } = $$props;
  let { image_size = { top: 0, left: 0, width: 0, height: 0 } } = $$props;
  let { el = void 0 } = $$props;
  let { parent_el = void 0 } = $$props;
  let inner;
  let px = 0;
  let active = false;
  let container_width = 0;
  function set_position(width) {
    container_width = (parent_el == null ? void 0 : parent_el.getBoundingClientRect().width) || 0;
    if (width === 0) {
      $$invalidate(0, image_size.width = (el == null ? void 0 : el.getBoundingClientRect().width) || 0, image_size);
    }
    $$invalidate(6, px = clamp(image_size.width * position + image_size.left, 0, container_width));
  }
  function update_position(x) {
    $$invalidate(6, px = clamp(x, 0, container_width));
    $$invalidate(9, position = round((x - image_size.left) / image_size.width, 5));
  }
  function drag_start(event) {
    if (disabled)
      return;
    $$invalidate(7, active = true);
    update_position(event.x);
  }
  function drag_move(event) {
    if (disabled)
      return;
    update_position(event.x);
  }
  function drag_end() {
    if (disabled)
      return;
    $$invalidate(7, active = false);
  }
  function update_position_from_pc(pc) {
    $$invalidate(6, px = clamp(image_size.width * pc + image_size.left, 0, container_width));
  }
  onMount(() => {
    set_position(image_size.width);
    const drag_handler = drag().on("start", drag_start).on("drag", drag_move).on("end", drag_end);
    select(inner).call(drag_handler);
  });
  const resize_handler = () => set_position(image_size.width);
  function div0_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      el = $$value;
      $$invalidate(1, el);
    });
  }
  function div2_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      inner = $$value;
      $$invalidate(5, inner);
    });
  }
  function div3_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      parent_el = $$value;
      $$invalidate(2, parent_el);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("position" in $$props2)
      $$invalidate(9, position = $$props2.position);
    if ("disabled" in $$props2)
      $$invalidate(3, disabled = $$props2.disabled);
    if ("slider_color" in $$props2)
      $$invalidate(4, slider_color = $$props2.slider_color);
    if ("image_size" in $$props2)
      $$invalidate(0, image_size = $$props2.image_size);
    if ("el" in $$props2)
      $$invalidate(1, el = $$props2.el);
    if ("parent_el" in $$props2)
      $$invalidate(2, parent_el = $$props2.parent_el);
    if ("$$scope" in $$props2)
      $$invalidate(10, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*image_size*/
    1) {
      set_position(image_size.width);
    }
    if ($$self.$$.dirty & /*position*/
    512) {
      update_position_from_pc(position);
    }
  };
  return [
    image_size,
    el,
    parent_el,
    disabled,
    slider_color,
    inner,
    px,
    active,
    set_position,
    position,
    $$scope,
    slots,
    resize_handler,
    div0_binding,
    div2_binding,
    div3_binding
  ];
}
class Slider extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {
      position: 9,
      disabled: 3,
      slider_color: 4,
      image_size: 0,
      el: 1,
      parent_el: 2
    });
  }
}
function create_fragment$5(ctx) {
  let img;
  let img_src_value;
  let mounted;
  let dispose;
  let img_levels = [
    {
      src: img_src_value = /*resolved_src*/
      ctx[7]
    },
    /*$$restProps*/
    ctx[9]
  ];
  let img_data = {};
  for (let i = 0; i < img_levels.length; i += 1) {
    img_data = assign(img_data, img_levels[i]);
  }
  return {
    c() {
      img = element("img");
      this.h();
    },
    l(nodes) {
      img = claim_element(nodes, "IMG", { src: true });
      this.h();
    },
    h() {
      set_attributes(img, img_data);
      toggle_class(
        img,
        "fixed",
        /*fixed*/
        ctx[2]
      );
      toggle_class(
        img,
        "hidden",
        /*hidden*/
        ctx[4]
      );
      toggle_class(
        img,
        "preview",
        /*variant*/
        ctx[5] === "preview"
      );
      toggle_class(
        img,
        "slider",
        /*variant*/
        ctx[5] === "upload"
      );
      toggle_class(
        img,
        "fullscreen",
        /*fullscreen*/
        ctx[1]
      );
      toggle_class(img, "small", !/*fullscreen*/
      ctx[1]);
      set_style(
        img,
        "transform",
        /*transform*/
        ctx[3]
      );
      set_style(
        img,
        "max-height",
        /*max_height*/
        ctx[6] && !/*fullscreen*/
        ctx[1] ? `${/*max_height*/
        ctx[6]}px` : null
      );
      toggle_class(img, "svelte-k63p1v", true);
    },
    m(target, anchor) {
      insert_hydration(target, img, anchor);
      ctx[12](img);
      if (!mounted) {
        dispose = listen(
          img,
          "load",
          /*load_handler*/
          ctx[13]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      set_attributes(img, img_data = get_spread_update(img_levels, [
        dirty & /*resolved_src*/
        128 && !src_url_equal(img.src, img_src_value = /*resolved_src*/
        ctx2[7]) && { src: img_src_value },
        dirty & /*$$restProps*/
        512 && /*$$restProps*/
        ctx2[9]
      ]));
      toggle_class(
        img,
        "fixed",
        /*fixed*/
        ctx2[2]
      );
      toggle_class(
        img,
        "hidden",
        /*hidden*/
        ctx2[4]
      );
      toggle_class(
        img,
        "preview",
        /*variant*/
        ctx2[5] === "preview"
      );
      toggle_class(
        img,
        "slider",
        /*variant*/
        ctx2[5] === "upload"
      );
      toggle_class(
        img,
        "fullscreen",
        /*fullscreen*/
        ctx2[1]
      );
      toggle_class(img, "small", !/*fullscreen*/
      ctx2[1]);
      set_style(
        img,
        "transform",
        /*transform*/
        ctx2[3]
      );
      set_style(
        img,
        "max-height",
        /*max_height*/
        ctx2[6] && !/*fullscreen*/
        ctx2[1] ? `${/*max_height*/
        ctx2[6]}px` : null
      );
      toggle_class(img, "svelte-k63p1v", true);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(img);
      }
      ctx[12](null);
      mounted = false;
      dispose();
    }
  };
}
function get_image_size(img) {
  var _a;
  if (!img)
    return { top: 0, left: 0, width: 0, height: 0 };
  const container = (_a = img.parentElement) == null ? void 0 : _a.getBoundingClientRect();
  if (!container)
    return { top: 0, left: 0, width: 0, height: 0 };
  const naturalAspect = img.naturalWidth / img.naturalHeight;
  const containerAspect = container.width / container.height;
  let displayedWidth, displayedHeight;
  if (naturalAspect > containerAspect) {
    displayedWidth = container.width;
    displayedHeight = container.width / naturalAspect;
  } else {
    displayedHeight = container.height;
    displayedWidth = container.height * naturalAspect;
  }
  const offsetX = (container.width - displayedWidth) / 2;
  const offsetY = (container.height - displayedHeight) / 2;
  return {
    top: offsetY,
    left: offsetX,
    width: displayedWidth,
    height: displayedHeight
  };
}
function instance$5($$self, $$props, $$invalidate) {
  const omit_props_names = [
    "src",
    "fullscreen",
    "fixed",
    "transform",
    "img_el",
    "hidden",
    "variant",
    "max_height"
  ];
  let $$restProps = compute_rest_props($$props, omit_props_names);
  let { src = void 0 } = $$props;
  let { fullscreen = false } = $$props;
  let resolved_src;
  let { fixed = false } = $$props;
  let { transform = "translate(0px, 0px) scale(1)" } = $$props;
  let { img_el = null } = $$props;
  let { hidden = false } = $$props;
  let { variant = "upload" } = $$props;
  let { max_height = 500 } = $$props;
  let latest_src;
  const dispatch2 = createEventDispatcher();
  onMount(() => {
    const resizer = new ResizeObserver(async (entries) => {
      for (const entry of entries) {
        await tick();
        dispatch2("load", get_image_size(img_el));
      }
    });
    resizer.observe(img_el);
    return () => {
      resizer.disconnect();
    };
  });
  function img_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      img_el = $$value;
      $$invalidate(0, img_el);
    });
  }
  const load_handler = () => dispatch2("load", get_image_size(img_el));
  $$self.$$set = ($$new_props) => {
    $$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    $$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    if ("src" in $$new_props)
      $$invalidate(10, src = $$new_props.src);
    if ("fullscreen" in $$new_props)
      $$invalidate(1, fullscreen = $$new_props.fullscreen);
    if ("fixed" in $$new_props)
      $$invalidate(2, fixed = $$new_props.fixed);
    if ("transform" in $$new_props)
      $$invalidate(3, transform = $$new_props.transform);
    if ("img_el" in $$new_props)
      $$invalidate(0, img_el = $$new_props.img_el);
    if ("hidden" in $$new_props)
      $$invalidate(4, hidden = $$new_props.hidden);
    if ("variant" in $$new_props)
      $$invalidate(5, variant = $$new_props.variant);
    if ("max_height" in $$new_props)
      $$invalidate(6, max_height = $$new_props.max_height);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*src, latest_src*/
    3072) {
      {
        $$invalidate(7, resolved_src = src);
        $$invalidate(11, latest_src = src);
        const resolving_src = src;
        resolve_wasm_src(resolving_src).then((s) => {
          if (latest_src === resolving_src) {
            $$invalidate(7, resolved_src = s);
          }
        });
      }
    }
  };
  return [
    img_el,
    fullscreen,
    fixed,
    transform,
    hidden,
    variant,
    max_height,
    resolved_src,
    dispatch2,
    $$restProps,
    src,
    latest_src,
    img_binding,
    load_handler
  ];
}
class ImageEl extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, {
      src: 10,
      fullscreen: 1,
      fixed: 2,
      transform: 3,
      img_el: 0,
      hidden: 4,
      variant: 5,
      max_height: 6
    });
  }
}
class ZoomableImage {
  constructor(container, image) {
    __publicField(this, "container");
    __publicField(this, "image");
    __publicField(this, "scale");
    __publicField(this, "offsetX");
    __publicField(this, "offsetY");
    __publicField(this, "isDragging");
    __publicField(this, "lastX");
    __publicField(this, "lastY");
    __publicField(this, "initial_left_padding");
    __publicField(this, "initial_top_padding");
    __publicField(this, "initial_width");
    __publicField(this, "initial_height");
    __publicField(this, "subscribers");
    __publicField(this, "handleImageLoad");
    __publicField(this, "real_image_size", { top: 0, left: 0, width: 0, height: 0 });
    __publicField(this, "last_touch_distance");
    this.container = container;
    this.image = image;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.initial_left_padding = 0;
    this.initial_top_padding = 0;
    this.initial_width = 0;
    this.initial_height = 0;
    this.subscribers = [];
    this.last_touch_distance = 0;
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleImageLoad = this.init.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.image.addEventListener("load", this.handleImageLoad);
    this.container.addEventListener("wheel", this.handleWheel);
    this.container.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
    this.container.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchend", this.handleTouchEnd);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.container) {
          this.handleResize();
          this.get_image_size(this.image);
        }
      }
    });
    observer.observe(this.container);
  }
  handleResize() {
    this.init();
  }
  init() {
    const containerRect = this.container.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    this.initial_left_padding = imageRect.left - containerRect.left;
    this.initial_top_padding = imageRect.top - containerRect.top;
    this.initial_width = imageRect.width;
    this.initial_height = imageRect.height;
    this.reset_zoom();
    this.updateTransform();
  }
  reset_zoom() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.updateTransform();
  }
  handleMouseDown(e) {
    const imageRect = this.image.getBoundingClientRect();
    if (e.clientX >= imageRect.left && e.clientX <= imageRect.right && e.clientY >= imageRect.top && e.clientY <= imageRect.bottom) {
      e.preventDefault();
      if (this.scale === 1)
        return;
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.image.style.cursor = "grabbing";
    }
  }
  handleMouseMove(e) {
    if (!this.isDragging)
      return;
    const deltaX = e.clientX - this.lastX;
    const deltaY = e.clientY - this.lastY;
    this.offsetX += deltaX;
    this.offsetY += deltaY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.updateTransform();
    this.updateTransform();
  }
  handleMouseUp() {
    if (this.isDragging) {
      this.constrain_to_bounds(true);
      this.updateTransform();
      this.isDragging = false;
      this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
    }
  }
  async handleWheel(e) {
    e.preventDefault();
    const containerRect = this.container.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();
    if (e.clientX < imageRect.left || e.clientX > imageRect.right || e.clientY < imageRect.top || e.clientY > imageRect.bottom) {
      return;
    }
    const zoomFactor = 1.05;
    const oldScale = this.scale;
    const newScale = -Math.sign(e.deltaY) > 0 ? Math.min(15, oldScale * zoomFactor) : Math.max(1, oldScale / zoomFactor);
    if (newScale === oldScale)
      return;
    const cursorX = e.clientX - containerRect.left - this.initial_left_padding;
    const cursorY = e.clientY - containerRect.top - this.initial_top_padding;
    this.scale = newScale;
    this.offsetX = this.compute_new_offset({
      cursor_position: cursorX,
      current_offset: this.offsetX,
      new_scale: newScale,
      old_scale: oldScale
    });
    this.offsetY = this.compute_new_offset({
      cursor_position: cursorY,
      current_offset: this.offsetY,
      new_scale: newScale,
      old_scale: oldScale
    });
    this.updateTransform();
    this.constrain_to_bounds();
    this.updateTransform();
    this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
  }
  // compute_offset_for_positions({ position: number, scale: number }) {
  // 	return position - (scale / this.scale) * (position - this.offset);
  // }
  compute_new_position({
    position,
    scale,
    anchor_position
  }) {
    return position - (position - anchor_position) * (scale / this.scale);
  }
  compute_new_offset({
    cursor_position,
    current_offset,
    new_scale,
    old_scale
  }) {
    return cursor_position - new_scale / old_scale * (cursor_position - current_offset);
  }
  constrain_to_bounds(pan = false) {
    if (this.scale === 1) {
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }
    const onscreen = {
      top: this.real_image_size.top * this.scale + this.offsetY,
      left: this.real_image_size.left * this.scale + this.offsetX,
      width: this.real_image_size.width * this.scale,
      height: this.real_image_size.height * this.scale,
      bottom: this.real_image_size.top * this.scale + this.offsetY + this.real_image_size.height * this.scale,
      right: this.real_image_size.left * this.scale + this.offsetX + this.real_image_size.width * this.scale
    };
    const real_image_size_right = this.real_image_size.left + this.real_image_size.width;
    const real_image_size_bottom = this.real_image_size.top + this.real_image_size.height;
    if (pan) {
      if (onscreen.top > this.real_image_size.top) {
        this.offsetY = this.calculate_position(
          this.real_image_size.top,
          0,
          "y"
        );
      } else if (onscreen.bottom < real_image_size_bottom) {
        this.offsetY = this.calculate_position(real_image_size_bottom, 1, "y");
      }
      if (onscreen.left > this.real_image_size.left) {
        this.offsetX = this.calculate_position(
          this.real_image_size.left,
          0,
          "x"
        );
      } else if (onscreen.right < real_image_size_right) {
        this.offsetX = this.calculate_position(real_image_size_right, 1, "x");
      }
    }
  }
  updateTransform() {
    this.notify({ x: this.offsetX, y: this.offsetY, scale: this.scale });
  }
  destroy() {
    this.container.removeEventListener("wheel", this.handleWheel);
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    this.container.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    this.image.removeEventListener("load", this.handleImageLoad);
  }
  subscribe(cb) {
    this.subscribers.push(cb);
  }
  unsubscribe(cb) {
    this.subscribers = this.subscribers.filter(
      (subscriber) => subscriber !== cb
    );
  }
  notify({ x, y, scale }) {
    this.subscribers.forEach((subscriber) => subscriber({ x, y, scale }));
  }
  handleTouchStart(e) {
    e.preventDefault();
    const imageRect = this.image.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch.clientX >= imageRect.left && touch.clientX <= imageRect.right && touch.clientY >= imageRect.top && touch.clientY <= imageRect.bottom) {
      if (e.touches.length === 1 && this.scale > 1) {
        this.isDragging = true;
        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
      } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        this.last_touch_distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    }
  }
  get_image_size(img) {
    var _a;
    if (!img)
      return;
    const container = (_a = img.parentElement) == null ? void 0 : _a.getBoundingClientRect();
    if (!container)
      return;
    const naturalAspect = img.naturalWidth / img.naturalHeight;
    const containerAspect = container.width / container.height;
    let displayedWidth, displayedHeight;
    if (naturalAspect > containerAspect) {
      displayedWidth = container.width;
      displayedHeight = container.width / naturalAspect;
    } else {
      displayedHeight = container.height;
      displayedWidth = container.height * naturalAspect;
    }
    const offsetX = (container.width - displayedWidth) / 2;
    const offsetY = (container.height - displayedHeight) / 2;
    this.real_image_size = {
      top: offsetY,
      left: offsetX,
      width: displayedWidth,
      height: displayedHeight
    };
  }
  handleTouchMove(e) {
    if (e.touches.length === 1 && this.isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.lastX;
      const deltaY = touch.clientY - this.lastY;
      this.offsetX += deltaX;
      this.offsetY += deltaY;
      this.lastX = touch.clientX;
      this.lastY = touch.clientY;
      this.updateTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const current_distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      if (this.last_touch_distance === 0) {
        this.last_touch_distance = current_distance;
        return;
      }
      const zoomFactor = current_distance / this.last_touch_distance;
      const oldScale = this.scale;
      const newScale = Math.min(15, Math.max(1, oldScale * zoomFactor));
      if (newScale === oldScale) {
        this.last_touch_distance = current_distance;
        return;
      }
      const containerRect = this.container.getBoundingClientRect();
      const midX = (touch1.clientX + touch2.clientX) / 2 - containerRect.left - this.initial_left_padding;
      const midY = (touch1.clientY + touch2.clientY) / 2 - containerRect.top - this.initial_top_padding;
      this.scale = newScale;
      this.offsetX = this.compute_new_offset({
        cursor_position: midX,
        current_offset: this.offsetX,
        new_scale: newScale,
        old_scale: oldScale
      });
      this.offsetY = this.compute_new_offset({
        cursor_position: midY,
        current_offset: this.offsetY,
        new_scale: newScale,
        old_scale: oldScale
      });
      this.updateTransform();
      this.constrain_to_bounds();
      this.updateTransform();
      this.last_touch_distance = current_distance;
      this.image.style.cursor = this.scale > 1 ? "grab" : "zoom-in";
    }
  }
  handleTouchEnd(e) {
    if (this.isDragging) {
      this.constrain_to_bounds(true);
      this.updateTransform();
      this.isDragging = false;
    }
    if (e.touches.length === 0) {
      this.last_touch_distance = 0;
    }
  }
  calculate_position(screen_coord, image_anchor, axis) {
    this.container.getBoundingClientRect();
    if (axis === "x") {
      const relative_screen_x = screen_coord;
      const anchor_x = this.real_image_size.left + image_anchor * this.real_image_size.width;
      return relative_screen_x - anchor_x * this.scale;
    }
    if (axis === "y") {
      const relative_screen_y = screen_coord;
      const anchor_y = this.real_image_size.top + image_anchor * this.real_image_size.height;
      return relative_screen_y - anchor_y * this.scale;
    }
    return 0;
  }
}
function create_else_block$2(ctx) {
  let div1;
  let iconbuttonwrapper;
  let t;
  let div0;
  let slider;
  let updating_position;
  let updating_el;
  let updating_parent_el;
  let div0_resize_listener;
  let current;
  iconbuttonwrapper = new IconButtonWrapper({
    props: {
      $$slots: { default: [create_default_slot_2$2] },
      $$scope: { ctx }
    }
  });
  function slider_position_binding(value) {
    ctx[32](value);
  }
  function slider_el_binding(value) {
    ctx[33](value);
  }
  function slider_parent_el_binding(value) {
    ctx[34](value);
  }
  let slider_props = {
    slider_color: (
      /*slider_color*/
      ctx[9]
    ),
    image_size: (
      /*image_size*/
      ctx[15]
    ),
    $$slots: { default: [create_default_slot_1$2] },
    $$scope: { ctx }
  };
  if (
    /*position*/
    ctx[0] !== void 0
  ) {
    slider_props.position = /*position*/
    ctx[0];
  }
  if (
    /*slider_wrap*/
    ctx[14] !== void 0
  ) {
    slider_props.el = /*slider_wrap*/
    ctx[14];
  }
  if (
    /*parent_el*/
    ctx[18] !== void 0
  ) {
    slider_props.parent_el = /*parent_el*/
    ctx[18];
  }
  slider = new Slider({ props: slider_props });
  binding_callbacks.push(() => bind(slider, "position", slider_position_binding));
  binding_callbacks.push(() => bind(slider, "el", slider_el_binding));
  binding_callbacks.push(() => bind(slider, "parent_el", slider_parent_el_binding));
  return {
    c() {
      div1 = element("div");
      create_component(iconbuttonwrapper.$$.fragment);
      t = space();
      div0 = element("div");
      create_component(slider.$$.fragment);
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      claim_component(iconbuttonwrapper.$$.fragment, div1_nodes);
      t = claim_space(div1_nodes);
      div0 = claim_element(div1_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      claim_component(slider.$$.fragment, div0_nodes);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "slider-wrap svelte-eb87wk");
      add_render_callback(() => (
        /*div0_elementresize_handler*/
        ctx[36].call(div0)
      ));
      toggle_class(div0, "limit_height", !/*is_full_screen*/
      ctx[20]);
      attr(div1, "class", "image-container svelte-eb87wk");
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      mount_component(iconbuttonwrapper, div1, null);
      append_hydration(div1, t);
      append_hydration(div1, div0);
      mount_component(slider, div0, null);
      ctx[35](div0);
      div0_resize_listener = add_iframe_resize_listener(
        div0,
        /*div0_elementresize_handler*/
        ctx[36].bind(div0)
      );
      ctx[37](div1);
      current = true;
    },
    p(ctx2, dirty) {
      const iconbuttonwrapper_changes = {};
      if (dirty[0] & /*value, interactive, i18n, show_download_button, image_container, is_full_screen, show_fullscreen_button, $transform, zoomable_image*/
      1774674 | dirty[1] & /*$$scope*/
      1024) {
        iconbuttonwrapper_changes.$$scope = { dirty, ctx: ctx2 };
      }
      iconbuttonwrapper.$set(iconbuttonwrapper_changes);
      const slider_changes = {};
      if (dirty[0] & /*slider_color*/
      512)
        slider_changes.slider_color = /*slider_color*/
        ctx2[9];
      if (dirty[0] & /*image_size*/
      32768)
        slider_changes.image_size = /*image_size*/
        ctx2[15];
      if (dirty[0] & /*layer_images, value, style, $transform, is_full_screen, max_height, img*/
      5318786 | dirty[1] & /*$$scope*/
      1024) {
        slider_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_position && dirty[0] & /*position*/
      1) {
        updating_position = true;
        slider_changes.position = /*position*/
        ctx2[0];
        add_flush_callback(() => updating_position = false);
      }
      if (!updating_el && dirty[0] & /*slider_wrap*/
      16384) {
        updating_el = true;
        slider_changes.el = /*slider_wrap*/
        ctx2[14];
        add_flush_callback(() => updating_el = false);
      }
      if (!updating_parent_el && dirty[0] & /*parent_el*/
      262144) {
        updating_parent_el = true;
        slider_changes.parent_el = /*parent_el*/
        ctx2[18];
        add_flush_callback(() => updating_parent_el = false);
      }
      slider.$set(slider_changes);
      if (!current || dirty[0] & /*is_full_screen*/
      1048576) {
        toggle_class(div0, "limit_height", !/*is_full_screen*/
        ctx2[20]);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(iconbuttonwrapper.$$.fragment, local);
      transition_in(slider.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbuttonwrapper.$$.fragment, local);
      transition_out(slider.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      destroy_component(iconbuttonwrapper);
      destroy_component(slider);
      ctx[35](null);
      div0_resize_listener();
      ctx[37](null);
    }
  };
}
function create_if_block$2(ctx) {
  let empty_1;
  let current;
  empty_1 = new Empty({
    props: {
      unpadded_box: true,
      size: "large",
      $$slots: { default: [create_default_slot$3] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(empty_1.$$.fragment);
    },
    l(nodes) {
      claim_component(empty_1.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(empty_1, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const empty_1_changes = {};
      if (dirty[1] & /*$$scope*/
      1024) {
        empty_1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      empty_1.$set(empty_1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(empty_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(empty_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(empty_1, detaching);
    }
  };
}
function create_if_block_3$1(ctx) {
  let fullscreenbutton;
  let updating_is_full_screen;
  let current;
  function fullscreenbutton_is_full_screen_binding(value) {
    ctx[29](value);
  }
  let fullscreenbutton_props = { container: (
    /*image_container*/
    ctx[17]
  ) };
  if (
    /*is_full_screen*/
    ctx[20] !== void 0
  ) {
    fullscreenbutton_props.is_full_screen = /*is_full_screen*/
    ctx[20];
  }
  fullscreenbutton = new FullscreenButton({ props: fullscreenbutton_props });
  binding_callbacks.push(() => bind(fullscreenbutton, "is_full_screen", fullscreenbutton_is_full_screen_binding));
  return {
    c() {
      create_component(fullscreenbutton.$$.fragment);
    },
    l(nodes) {
      claim_component(fullscreenbutton.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(fullscreenbutton, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const fullscreenbutton_changes = {};
      if (dirty[0] & /*image_container*/
      131072)
        fullscreenbutton_changes.container = /*image_container*/
        ctx2[17];
      if (!updating_is_full_screen && dirty[0] & /*is_full_screen*/
      1048576) {
        updating_is_full_screen = true;
        fullscreenbutton_changes.is_full_screen = /*is_full_screen*/
        ctx2[20];
        add_flush_callback(() => updating_is_full_screen = false);
      }
      fullscreenbutton.$set(fullscreenbutton_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(fullscreenbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(fullscreenbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(fullscreenbutton, detaching);
    }
  };
}
function create_if_block_2$2(ctx) {
  var _a, _b;
  let downloadlink;
  let current;
  downloadlink = new DownloadLink({
    props: {
      href: (
        /*value*/
        (_a = ctx[1][1]) == null ? void 0 : _a.url
      ),
      download: (
        /*value*/
        ((_b = ctx[1][1]) == null ? void 0 : _b.orig_name) || "image"
      ),
      $$slots: { default: [create_default_slot_3$2] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(downloadlink.$$.fragment);
    },
    l(nodes) {
      claim_component(downloadlink.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(downloadlink, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2, _b2;
      const downloadlink_changes = {};
      if (dirty[0] & /*value*/
      2)
        downloadlink_changes.href = /*value*/
        (_a2 = ctx2[1][1]) == null ? void 0 : _a2.url;
      if (dirty[0] & /*value*/
      2)
        downloadlink_changes.download = /*value*/
        ((_b2 = ctx2[1][1]) == null ? void 0 : _b2.orig_name) || "image";
      if (dirty[0] & /*i18n*/
      64 | dirty[1] & /*$$scope*/
      1024) {
        downloadlink_changes.$$scope = { dirty, ctx: ctx2 };
      }
      downloadlink.$set(downloadlink_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(downloadlink.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(downloadlink.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(downloadlink, detaching);
    }
  };
}
function create_default_slot_3$2(ctx) {
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: {
      Icon: Download,
      label: (
        /*i18n*/
        ctx[6]("common.download")
      )
    }
  });
  return {
    c() {
      create_component(iconbutton.$$.fragment);
    },
    l(nodes) {
      claim_component(iconbutton.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(iconbutton, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const iconbutton_changes = {};
      if (dirty[0] & /*i18n*/
      64)
        iconbutton_changes.label = /*i18n*/
        ctx2[6]("common.download");
      iconbutton.$set(iconbutton_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(iconbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(iconbutton, detaching);
    }
  };
}
function create_if_block_1$2(ctx) {
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: { Icon: Clear, label: "Remove Image" }
  });
  iconbutton.$on(
    "click",
    /*click_handler_1*/
    ctx[30]
  );
  return {
    c() {
      create_component(iconbutton.$$.fragment);
    },
    l(nodes) {
      claim_component(iconbutton.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(iconbutton, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(iconbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(iconbutton, detaching);
    }
  };
}
function create_default_slot_2$2(ctx) {
  let iconbutton;
  let t0;
  let t1;
  let t2;
  let if_block2_anchor;
  let current;
  iconbutton = new IconButton({
    props: {
      Icon: Undo,
      label: (
        /*i18n*/
        ctx[6]("common.undo")
      ),
      disabled: (
        /*$transform*/
        ctx[16].z === 1
      )
    }
  });
  iconbutton.$on(
    "click",
    /*click_handler*/
    ctx[28]
  );
  let if_block0 = (
    /*show_fullscreen_button*/
    ctx[10] && create_if_block_3$1(ctx)
  );
  let if_block1 = (
    /*show_download_button*/
    ctx[4] && create_if_block_2$2(ctx)
  );
  let if_block2 = (
    /*interactive*/
    ctx[12] && create_if_block_1$2(ctx)
  );
  return {
    c() {
      create_component(iconbutton.$$.fragment);
      t0 = space();
      if (if_block0)
        if_block0.c();
      t1 = space();
      if (if_block1)
        if_block1.c();
      t2 = space();
      if (if_block2)
        if_block2.c();
      if_block2_anchor = empty();
    },
    l(nodes) {
      claim_component(iconbutton.$$.fragment, nodes);
      t0 = claim_space(nodes);
      if (if_block0)
        if_block0.l(nodes);
      t1 = claim_space(nodes);
      if (if_block1)
        if_block1.l(nodes);
      t2 = claim_space(nodes);
      if (if_block2)
        if_block2.l(nodes);
      if_block2_anchor = empty();
    },
    m(target, anchor) {
      mount_component(iconbutton, target, anchor);
      insert_hydration(target, t0, anchor);
      if (if_block0)
        if_block0.m(target, anchor);
      insert_hydration(target, t1, anchor);
      if (if_block1)
        if_block1.m(target, anchor);
      insert_hydration(target, t2, anchor);
      if (if_block2)
        if_block2.m(target, anchor);
      insert_hydration(target, if_block2_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const iconbutton_changes = {};
      if (dirty[0] & /*i18n*/
      64)
        iconbutton_changes.label = /*i18n*/
        ctx2[6]("common.undo");
      if (dirty[0] & /*$transform*/
      65536)
        iconbutton_changes.disabled = /*$transform*/
        ctx2[16].z === 1;
      iconbutton.$set(iconbutton_changes);
      if (
        /*show_fullscreen_button*/
        ctx2[10]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*show_fullscreen_button*/
          1024) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_3$1(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(t1.parentNode, t1);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*show_download_button*/
        ctx2[4]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*show_download_button*/
          16) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_2$2(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(t2.parentNode, t2);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (
        /*interactive*/
        ctx2[12]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & /*interactive*/
          4096) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_1$2(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(iconbutton.$$.fragment, local);
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t0);
        detach(t1);
        detach(t2);
        detach(if_block2_anchor);
      }
      destroy_component(iconbutton, detaching);
      if (if_block0)
        if_block0.d(detaching);
      if (if_block1)
        if_block1.d(detaching);
      if (if_block2)
        if_block2.d(detaching);
    }
  };
}
function create_default_slot_1$2(ctx) {
  var _a, _b, _c, _d, _e, _f;
  let imageel0;
  let updating_img_el;
  let t;
  let imageel1;
  let current;
  function imageel0_img_el_binding(value) {
    ctx[31](value);
  }
  let imageel0_props = {
    src: (
      /*value*/
      (_b = (_a = ctx[1]) == null ? void 0 : _a[0]) == null ? void 0 : _b.url
    ),
    alt: "",
    loading: "lazy",
    variant: "preview",
    transform: "translate(" + /*$transform*/
    ctx[16].x + "px, " + /*$transform*/
    ctx[16].y + "px) scale(" + /*$transform*/
    ctx[16].z + ")",
    fullscreen: (
      /*is_full_screen*/
      ctx[20]
    ),
    max_height: (
      /*max_height*/
      ctx[11]
    )
  };
  if (
    /*img*/
    ctx[13] !== void 0
  ) {
    imageel0_props.img_el = /*img*/
    ctx[13];
  }
  imageel0 = new ImageEl({ props: imageel0_props });
  binding_callbacks.push(() => bind(imageel0, "img_el", imageel0_img_el_binding));
  imageel0.$on(
    "load",
    /*handle_image_load*/
    ctx[25]
  );
  imageel1 = new ImageEl({
    props: {
      variant: "preview",
      fixed: (
        /*layer_images*/
        ctx[7]
      ),
      hidden: !/*value*/
      ((_d = (_c = ctx[1]) == null ? void 0 : _c[1]) == null ? void 0 : _d.url),
      src: (
        /*value*/
        (_f = (_e = ctx[1]) == null ? void 0 : _e[1]) == null ? void 0 : _f.url
      ),
      alt: "",
      loading: "lazy",
      style: (
        /*style*/
        ctx[22]
      ),
      transform: "translate(" + /*$transform*/
      ctx[16].x + "px, " + /*$transform*/
      ctx[16].y + "px) scale(" + /*$transform*/
      ctx[16].z + ")",
      fullscreen: (
        /*is_full_screen*/
        ctx[20]
      ),
      max_height: (
        /*max_height*/
        ctx[11]
      )
    }
  });
  imageel1.$on(
    "load",
    /*handle_image_load*/
    ctx[25]
  );
  return {
    c() {
      create_component(imageel0.$$.fragment);
      t = space();
      create_component(imageel1.$$.fragment);
    },
    l(nodes) {
      claim_component(imageel0.$$.fragment, nodes);
      t = claim_space(nodes);
      claim_component(imageel1.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(imageel0, target, anchor);
      insert_hydration(target, t, anchor);
      mount_component(imageel1, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2, _b2, _c2, _d2, _e2, _f2;
      const imageel0_changes = {};
      if (dirty[0] & /*value*/
      2)
        imageel0_changes.src = /*value*/
        (_b2 = (_a2 = ctx2[1]) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.url;
      if (dirty[0] & /*$transform*/
      65536)
        imageel0_changes.transform = "translate(" + /*$transform*/
        ctx2[16].x + "px, " + /*$transform*/
        ctx2[16].y + "px) scale(" + /*$transform*/
        ctx2[16].z + ")";
      if (dirty[0] & /*is_full_screen*/
      1048576)
        imageel0_changes.fullscreen = /*is_full_screen*/
        ctx2[20];
      if (dirty[0] & /*max_height*/
      2048)
        imageel0_changes.max_height = /*max_height*/
        ctx2[11];
      if (!updating_img_el && dirty[0] & /*img*/
      8192) {
        updating_img_el = true;
        imageel0_changes.img_el = /*img*/
        ctx2[13];
        add_flush_callback(() => updating_img_el = false);
      }
      imageel0.$set(imageel0_changes);
      const imageel1_changes = {};
      if (dirty[0] & /*layer_images*/
      128)
        imageel1_changes.fixed = /*layer_images*/
        ctx2[7];
      if (dirty[0] & /*value*/
      2)
        imageel1_changes.hidden = !/*value*/
        ((_d2 = (_c2 = ctx2[1]) == null ? void 0 : _c2[1]) == null ? void 0 : _d2.url);
      if (dirty[0] & /*value*/
      2)
        imageel1_changes.src = /*value*/
        (_f2 = (_e2 = ctx2[1]) == null ? void 0 : _e2[1]) == null ? void 0 : _f2.url;
      if (dirty[0] & /*style*/
      4194304)
        imageel1_changes.style = /*style*/
        ctx2[22];
      if (dirty[0] & /*$transform*/
      65536)
        imageel1_changes.transform = "translate(" + /*$transform*/
        ctx2[16].x + "px, " + /*$transform*/
        ctx2[16].y + "px) scale(" + /*$transform*/
        ctx2[16].z + ")";
      if (dirty[0] & /*is_full_screen*/
      1048576)
        imageel1_changes.fullscreen = /*is_full_screen*/
        ctx2[20];
      if (dirty[0] & /*max_height*/
      2048)
        imageel1_changes.max_height = /*max_height*/
        ctx2[11];
      imageel1.$set(imageel1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(imageel0.$$.fragment, local);
      transition_in(imageel1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(imageel0.$$.fragment, local);
      transition_out(imageel1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t);
      }
      destroy_component(imageel0, detaching);
      destroy_component(imageel1, detaching);
    }
  };
}
function create_default_slot$3(ctx) {
  let image;
  let current;
  image = new Image({});
  return {
    c() {
      create_component(image.$$.fragment);
    },
    l(nodes) {
      claim_component(image.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(image, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(image.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(image.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(image, detaching);
    }
  };
}
function create_fragment$4(ctx) {
  let blocklabel;
  let t;
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  blocklabel = new BlockLabel({
    props: {
      show_label: (
        /*show_label*/
        ctx[5]
      ),
      Icon: Image,
      label: (
        /*label*/
        ctx[3] || /*i18n*/
        ctx[6]("image.image")
      )
    }
  });
  const if_block_creators = [create_if_block$2, create_else_block$2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*value*/
      (ctx2[1] === null || /*value*/
      ctx2[1][0] === null || /*value*/
      ctx2[1][1] === null) && !/*show_single*/
      ctx2[8]
    )
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      create_component(blocklabel.$$.fragment);
      t = space();
      if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      claim_component(blocklabel.$$.fragment, nodes);
      t = claim_space(nodes);
      if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      mount_component(blocklabel, target, anchor);
      insert_hydration(target, t, anchor);
      if_blocks[current_block_type_index].m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const blocklabel_changes = {};
      if (dirty[0] & /*show_label*/
      32)
        blocklabel_changes.show_label = /*show_label*/
        ctx2[5];
      if (dirty[0] & /*label, i18n*/
      72)
        blocklabel_changes.label = /*label*/
        ctx2[3] || /*i18n*/
        ctx2[6]("image.image");
      blocklabel.$set(blocklabel_changes);
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(blocklabel.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(blocklabel.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t);
        detach(if_block_anchor);
      }
      destroy_component(blocklabel, detaching);
      if_blocks[current_block_type_index].d(detaching);
    }
  };
}
function get_coords_at_viewport(viewport_percent_x, viewportWidth, image_width, img_offset_x, tx, scale) {
  const px_relative_to_image = viewport_percent_x * image_width;
  const pixel_position = px_relative_to_image + img_offset_x;
  const normalised_position = (pixel_position - tx) / scale;
  const percent_position = normalised_position / viewportWidth;
  return percent_position;
}
function instance$4($$self, $$props, $$invalidate) {
  let coords_at_viewport;
  let style;
  let $transform;
  let { value = [null, null] } = $$props;
  let { label = void 0 } = $$props;
  let { show_download_button = true } = $$props;
  let { show_label } = $$props;
  let { i18n } = $$props;
  let { position } = $$props;
  let { layer_images = true } = $$props;
  let { show_single = false } = $$props;
  let { slider_color } = $$props;
  let { show_fullscreen_button = true } = $$props;
  let { el_width = 0 } = $$props;
  let { max_height } = $$props;
  let { interactive = true } = $$props;
  const dispatch2 = createEventDispatcher();
  let img;
  let slider_wrap;
  let image_container;
  let transform = tweened({ x: 0, y: 0, z: 1 }, { duration: 75 });
  component_subscribe($$self, transform, (value2) => $$invalidate(16, $transform = value2));
  let parent_el;
  let viewport_width = 0;
  let zoomable_image = null;
  let observer = null;
  function init_image(img2, slider_wrap2) {
    if (!img2 || !slider_wrap2)
      return;
    zoomable_image == null ? void 0 : zoomable_image.destroy();
    observer == null ? void 0 : observer.disconnect();
    (img2 == null ? void 0 : img2.getBoundingClientRect().width) || 0;
    $$invalidate(26, viewport_width = (slider_wrap2 == null ? void 0 : slider_wrap2.getBoundingClientRect().width) || 0);
    $$invalidate(19, zoomable_image = new ZoomableImage(slider_wrap2, img2));
    zoomable_image.subscribe(({ x, y, scale }) => {
      transform.set({ x, y, z: scale });
    });
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === slider_wrap2) {
          $$invalidate(26, viewport_width = entry.contentRect.width);
        }
        if (entry.target === img2) {
          entry.contentRect.width;
        }
      }
    });
    observer.observe(slider_wrap2);
    observer.observe(img2);
  }
  onMount(() => {
    return () => {
      zoomable_image == null ? void 0 : zoomable_image.destroy();
      observer == null ? void 0 : observer.disconnect();
    };
  });
  let is_full_screen = false;
  let slider_wrap_parent;
  let image_size = { top: 0, left: 0, width: 0, height: 0 };
  function handle_image_load(event) {
    $$invalidate(15, image_size = event.detail);
  }
  const click_handler = () => zoomable_image == null ? void 0 : zoomable_image.reset_zoom();
  function fullscreenbutton_is_full_screen_binding(value2) {
    is_full_screen = value2;
    $$invalidate(20, is_full_screen);
  }
  const click_handler_1 = (event) => {
    $$invalidate(1, value = [null, null]);
    dispatch2("clear");
    event.stopPropagation();
  };
  function imageel0_img_el_binding(value2) {
    img = value2;
    $$invalidate(13, img);
  }
  function slider_position_binding(value2) {
    position = value2;
    $$invalidate(0, position);
  }
  function slider_el_binding(value2) {
    slider_wrap = value2;
    $$invalidate(14, slider_wrap);
  }
  function slider_parent_el_binding(value2) {
    parent_el = value2;
    $$invalidate(18, parent_el);
  }
  function div0_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      slider_wrap_parent = $$value;
      $$invalidate(21, slider_wrap_parent);
    });
  }
  function div0_elementresize_handler() {
    el_width = this.clientWidth;
    $$invalidate(2, el_width);
  }
  function div1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      image_container = $$value;
      $$invalidate(17, image_container);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(1, value = $$props2.value);
    if ("label" in $$props2)
      $$invalidate(3, label = $$props2.label);
    if ("show_download_button" in $$props2)
      $$invalidate(4, show_download_button = $$props2.show_download_button);
    if ("show_label" in $$props2)
      $$invalidate(5, show_label = $$props2.show_label);
    if ("i18n" in $$props2)
      $$invalidate(6, i18n = $$props2.i18n);
    if ("position" in $$props2)
      $$invalidate(0, position = $$props2.position);
    if ("layer_images" in $$props2)
      $$invalidate(7, layer_images = $$props2.layer_images);
    if ("show_single" in $$props2)
      $$invalidate(8, show_single = $$props2.show_single);
    if ("slider_color" in $$props2)
      $$invalidate(9, slider_color = $$props2.slider_color);
    if ("show_fullscreen_button" in $$props2)
      $$invalidate(10, show_fullscreen_button = $$props2.show_fullscreen_button);
    if ("el_width" in $$props2)
      $$invalidate(2, el_width = $$props2.el_width);
    if ("max_height" in $$props2)
      $$invalidate(11, max_height = $$props2.max_height);
    if ("interactive" in $$props2)
      $$invalidate(12, interactive = $$props2.interactive);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*position, viewport_width, image_size, $transform*/
    67207169) {
      $$invalidate(27, coords_at_viewport = get_coords_at_viewport(position, viewport_width, image_size.width, image_size.left, $transform.x, $transform.z));
    }
    if ($$self.$$.dirty[0] & /*layer_images, coords_at_viewport*/
    134217856) {
      $$invalidate(22, style = layer_images ? `clip-path: inset(0 0 0 ${coords_at_viewport * 100}%)` : "");
    }
    if ($$self.$$.dirty[0] & /*img, slider_wrap*/
    24576) {
      init_image(img, slider_wrap);
    }
  };
  return [
    position,
    value,
    el_width,
    label,
    show_download_button,
    show_label,
    i18n,
    layer_images,
    show_single,
    slider_color,
    show_fullscreen_button,
    max_height,
    interactive,
    img,
    slider_wrap,
    image_size,
    $transform,
    image_container,
    parent_el,
    zoomable_image,
    is_full_screen,
    slider_wrap_parent,
    style,
    dispatch2,
    transform,
    handle_image_load,
    viewport_width,
    coords_at_viewport,
    click_handler,
    fullscreenbutton_is_full_screen_binding,
    click_handler_1,
    imageel0_img_el_binding,
    slider_position_binding,
    slider_el_binding,
    slider_parent_el_binding,
    div0_binding,
    div0_elementresize_handler,
    div1_binding
  ];
}
class SliderPreview extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$4,
      create_fragment$4,
      safe_not_equal,
      {
        value: 1,
        label: 3,
        show_download_button: 4,
        show_label: 5,
        i18n: 6,
        position: 0,
        layer_images: 7,
        show_single: 8,
        slider_color: 9,
        show_fullscreen_button: 10,
        el_width: 2,
        max_height: 11,
        interactive: 12
      },
      null,
      [-1, -1]
    );
  }
}
function create_fragment$3(ctx) {
  let div;
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: { Icon: Clear, label: "Remove Image" }
  });
  iconbutton.$on(
    "click",
    /*click_handler*/
    ctx[1]
  );
  return {
    c() {
      div = element("div");
      create_component(iconbutton.$$.fragment);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(iconbutton.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "svelte-s6ybro");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(iconbutton, div, null);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(iconbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(iconbutton);
    }
  };
}
function instance$3($$self) {
  const dispatch2 = createEventDispatcher();
  const click_handler = (event) => {
    dispatch2("remove_image");
    event.stopPropagation();
  };
  return [dispatch2, click_handler];
}
class ClearImage extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
  }
}
function create_if_block_6(ctx) {
  let clearimage;
  let current;
  clearimage = new ClearImage({});
  clearimage.$on(
    "remove_image",
    /*remove_image_handler*/
    ctx[22]
  );
  return {
    c() {
      create_component(clearimage.$$.fragment);
    },
    l(nodes) {
      claim_component(clearimage.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(clearimage, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(clearimage.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(clearimage.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(clearimage, detaching);
    }
  };
}
function create_if_block_4(ctx) {
  let div;
  let current;
  let if_block = (
    /*show_download_button*/
    ctx[7] && create_if_block_5(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      if (if_block)
        if_block.l(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "icon-buttons svelte-143b07a");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (if_block)
        if_block.m(div, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*show_download_button*/
        ctx2[7]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*show_download_button*/
          128) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_5(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block)
        if_block.d();
    }
  };
}
function create_if_block_5(ctx) {
  let downloadlink;
  let current;
  downloadlink = new DownloadLink({
    props: {
      href: (
        /*value*/
        ctx[0][1].url
      ),
      download: (
        /*value*/
        ctx[0][1].orig_name || "image"
      ),
      $$slots: { default: [create_default_slot_4] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(downloadlink.$$.fragment);
    },
    l(nodes) {
      claim_component(downloadlink.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(downloadlink, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const downloadlink_changes = {};
      if (dirty & /*value*/
      1)
        downloadlink_changes.href = /*value*/
        ctx2[0][1].url;
      if (dirty & /*value*/
      1)
        downloadlink_changes.download = /*value*/
        ctx2[0][1].orig_name || "image";
      if (dirty & /*$$scope*/
      1073741824) {
        downloadlink_changes.$$scope = { dirty, ctx: ctx2 };
      }
      downloadlink.$set(downloadlink_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(downloadlink.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(downloadlink.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(downloadlink, detaching);
    }
  };
}
function create_default_slot_4(ctx) {
  let iconbutton;
  let current;
  iconbutton = new IconButton({ props: { Icon: Download } });
  return {
    c() {
      create_component(iconbutton.$$.fragment);
    },
    l(nodes) {
      claim_component(iconbutton.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(iconbutton, target, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(iconbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(iconbutton, detaching);
    }
  };
}
function create_else_block$1(ctx) {
  var _a;
  let imageel;
  let updating_img_el;
  let current;
  function imageel_img_el_binding(value) {
    ctx[25](value);
  }
  let imageel_props = {
    variant: "upload",
    src: (
      /*value_*/
      (_a = ctx[14][0]) == null ? void 0 : _a.url
    ),
    alt: "",
    max_height: (
      /*max_height*/
      ctx[13]
    )
  };
  if (
    /*img*/
    ctx[15] !== void 0
  ) {
    imageel_props.img_el = /*img*/
    ctx[15];
  }
  imageel = new ImageEl({ props: imageel_props });
  binding_callbacks.push(() => bind(imageel, "img_el", imageel_img_el_binding));
  return {
    c() {
      create_component(imageel.$$.fragment);
    },
    l(nodes) {
      claim_component(imageel.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(imageel, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2;
      const imageel_changes = {};
      if (dirty & /*value_*/
      16384)
        imageel_changes.src = /*value_*/
        (_a2 = ctx2[14][0]) == null ? void 0 : _a2.url;
      if (dirty & /*max_height*/
      8192)
        imageel_changes.max_height = /*max_height*/
        ctx2[13];
      if (!updating_img_el && dirty & /*img*/
      32768) {
        updating_img_el = true;
        imageel_changes.img_el = /*img*/
        ctx2[15];
        add_flush_callback(() => updating_img_el = false);
      }
      imageel.$set(imageel_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(imageel.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(imageel.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(imageel, detaching);
    }
  };
}
function create_if_block_3(ctx) {
  var _a;
  let div;
  let upload_1;
  let updating_dragging;
  let current;
  function upload_1_dragging_binding(value) {
    ctx[23](value);
  }
  let upload_1_props = {
    filetype: "image/*",
    disable_click: !!/*value*/
    ((_a = ctx[0]) == null ? void 0 : _a[0]),
    root: (
      /*root*/
      ctx[5]
    ),
    file_count: "multiple",
    upload: (
      /*upload*/
      ctx[9]
    ),
    stream_handler: (
      /*stream_handler*/
      ctx[10]
    ),
    max_file_size: (
      /*max_file_size*/
      ctx[11]
    ),
    $$slots: { default: [create_default_slot_3$1] },
    $$scope: { ctx }
  };
  if (
    /*dragging*/
    ctx[1] !== void 0
  ) {
    upload_1_props.dragging = /*dragging*/
    ctx[1];
  }
  upload_1 = new Upload({ props: upload_1_props });
  binding_callbacks.push(() => bind(upload_1, "dragging", upload_1_dragging_binding));
  upload_1.$on(
    "load",
    /*load_handler*/
    ctx[24]
  );
  return {
    c() {
      div = element("div");
      create_component(upload_1.$$.fragment);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(upload_1.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "wrap svelte-143b07a");
      toggle_class(
        div,
        "half-wrap",
        /*upload_count*/
        ctx[6] === 1
      );
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(upload_1, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2;
      const upload_1_changes = {};
      if (dirty & /*value*/
      1)
        upload_1_changes.disable_click = !!/*value*/
        ((_a2 = ctx2[0]) == null ? void 0 : _a2[0]);
      if (dirty & /*root*/
      32)
        upload_1_changes.root = /*root*/
        ctx2[5];
      if (dirty & /*upload*/
      512)
        upload_1_changes.upload = /*upload*/
        ctx2[9];
      if (dirty & /*stream_handler*/
      1024)
        upload_1_changes.stream_handler = /*stream_handler*/
        ctx2[10];
      if (dirty & /*max_file_size*/
      2048)
        upload_1_changes.max_file_size = /*max_file_size*/
        ctx2[11];
      if (dirty & /*$$scope*/
      1073741824) {
        upload_1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_dragging && dirty & /*dragging*/
      2) {
        updating_dragging = true;
        upload_1_changes.dragging = /*dragging*/
        ctx2[1];
        add_flush_callback(() => updating_dragging = false);
      }
      upload_1.$set(upload_1_changes);
      if (!current || dirty & /*upload_count*/
      64) {
        toggle_class(
          div,
          "half-wrap",
          /*upload_count*/
          ctx2[6] === 1
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(upload_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(upload_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(upload_1);
    }
  };
}
function create_default_slot_3$1(ctx) {
  let current;
  const default_slot_template = (
    /*#slots*/
    ctx[21].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[30],
    null
  );
  return {
    c() {
      if (default_slot)
        default_slot.c();
    },
    l(nodes) {
      if (default_slot)
        default_slot.l(nodes);
    },
    m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & /*$$scope*/
        1073741824)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[30],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[30]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[30],
              dirty,
              null
            ),
            null
          );
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (default_slot)
        default_slot.d(detaching);
    }
  };
}
function create_if_block_2$1(ctx) {
  let imageel;
  let current;
  imageel = new ImageEl({
    props: {
      variant: "upload",
      src: (
        /*value_*/
        ctx[14][1].url
      ),
      alt: "",
      fixed: (
        /*upload_count*/
        ctx[6] === 1
      ),
      transform: "translate(0px, 0px) scale(1)",
      max_height: (
        /*max_height*/
        ctx[13]
      )
    }
  });
  return {
    c() {
      create_component(imageel.$$.fragment);
    },
    l(nodes) {
      claim_component(imageel.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(imageel, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const imageel_changes = {};
      if (dirty & /*value_*/
      16384)
        imageel_changes.src = /*value_*/
        ctx2[14][1].url;
      if (dirty & /*upload_count*/
      64)
        imageel_changes.fixed = /*upload_count*/
        ctx2[6] === 1;
      if (dirty & /*max_height*/
      8192)
        imageel_changes.max_height = /*max_height*/
        ctx2[13];
      imageel.$set(imageel_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(imageel.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(imageel.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(imageel, detaching);
    }
  };
}
function create_if_block_1$1(ctx) {
  let div;
  let empty_1;
  let style_width = `${/*el_width*/
  ctx[16] * (1 - /*position*/
  ctx[2])}px`;
  let style_transform = `translateX(${/*el_width*/
  ctx[16] * /*position*/
  ctx[2]}px)`;
  let current;
  empty_1 = new Empty({
    props: {
      unpadded_box: true,
      size: "large",
      $$slots: { default: [create_default_slot_2$1] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      div = element("div");
      create_component(empty_1.$$.fragment);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(empty_1.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      var _a, _b;
      attr(div, "class", "empty-wrap fixed svelte-143b07a");
      toggle_class(div, "white-icon", !/*value*/
      ((_b = (_a = ctx[0]) == null ? void 0 : _a[0]) == null ? void 0 : _b.url));
      set_style(div, "width", style_width);
      set_style(div, "transform", style_transform);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(empty_1, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      var _a, _b;
      const empty_1_changes = {};
      if (dirty & /*$$scope*/
      1073741824) {
        empty_1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      empty_1.$set(empty_1_changes);
      if (!current || dirty & /*value*/
      1) {
        toggle_class(div, "white-icon", !/*value*/
        ((_b = (_a = ctx2[0]) == null ? void 0 : _a[0]) == null ? void 0 : _b.url));
      }
      if (dirty & /*el_width, position*/
      65540 && style_width !== (style_width = `${/*el_width*/
      ctx2[16] * (1 - /*position*/
      ctx2[2])}px`)) {
        set_style(div, "width", style_width);
      }
      if (dirty & /*el_width, position*/
      65540 && style_transform !== (style_transform = `translateX(${/*el_width*/
      ctx2[16] * /*position*/
      ctx2[2]}px)`)) {
        set_style(div, "transform", style_transform);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(empty_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(empty_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(empty_1);
    }
  };
}
function create_if_block$1(ctx) {
  var _a;
  let upload_1;
  let updating_dragging;
  let current;
  function upload_1_dragging_binding_1(value) {
    ctx[26](value);
  }
  let upload_1_props = {
    filetype: "image/*",
    disable_click: !!/*value*/
    ((_a = ctx[0]) == null ? void 0 : _a[1]),
    root: (
      /*root*/
      ctx[5]
    ),
    file_count: "multiple",
    upload: (
      /*upload*/
      ctx[9]
    ),
    stream_handler: (
      /*stream_handler*/
      ctx[10]
    ),
    max_file_size: (
      /*max_file_size*/
      ctx[11]
    ),
    $$slots: { default: [create_default_slot_1$1] },
    $$scope: { ctx }
  };
  if (
    /*dragging*/
    ctx[1] !== void 0
  ) {
    upload_1_props.dragging = /*dragging*/
    ctx[1];
  }
  upload_1 = new Upload({ props: upload_1_props });
  binding_callbacks.push(() => bind(upload_1, "dragging", upload_1_dragging_binding_1));
  upload_1.$on(
    "load",
    /*load_handler_1*/
    ctx[27]
  );
  return {
    c() {
      create_component(upload_1.$$.fragment);
    },
    l(nodes) {
      claim_component(upload_1.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(upload_1, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2;
      const upload_1_changes = {};
      if (dirty & /*value*/
      1)
        upload_1_changes.disable_click = !!/*value*/
        ((_a2 = ctx2[0]) == null ? void 0 : _a2[1]);
      if (dirty & /*root*/
      32)
        upload_1_changes.root = /*root*/
        ctx2[5];
      if (dirty & /*upload*/
      512)
        upload_1_changes.upload = /*upload*/
        ctx2[9];
      if (dirty & /*stream_handler*/
      1024)
        upload_1_changes.stream_handler = /*stream_handler*/
        ctx2[10];
      if (dirty & /*max_file_size*/
      2048)
        upload_1_changes.max_file_size = /*max_file_size*/
        ctx2[11];
      if (dirty & /*$$scope*/
      1073741824) {
        upload_1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_dragging && dirty & /*dragging*/
      2) {
        updating_dragging = true;
        upload_1_changes.dragging = /*dragging*/
        ctx2[1];
        add_flush_callback(() => updating_dragging = false);
      }
      upload_1.$set(upload_1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(upload_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(upload_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(upload_1, detaching);
    }
  };
}
function create_default_slot_2$1(ctx) {
  let image;
  let current;
  image = new Image({});
  return {
    c() {
      create_component(image.$$.fragment);
    },
    l(nodes) {
      claim_component(image.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(image, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(image.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(image.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(image, detaching);
    }
  };
}
function create_default_slot_1$1(ctx) {
  let current;
  const default_slot_template = (
    /*#slots*/
    ctx[21].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[30],
    null
  );
  return {
    c() {
      if (default_slot)
        default_slot.c();
    },
    l(nodes) {
      if (default_slot)
        default_slot.l(nodes);
    },
    m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & /*$$scope*/
        1073741824)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[30],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[30]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[30],
              dirty,
              null
            ),
            null
          );
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (default_slot)
        default_slot.d(detaching);
    }
  };
}
function create_default_slot$2(ctx) {
  let div;
  let current_block_type_index;
  let if_block0;
  let t;
  let current_block_type_index_1;
  let if_block1;
  let current;
  const if_block_creators = [create_if_block_3, create_else_block$1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    var _a;
    if (!/*value_*/
    ((_a = ctx2[14]) == null ? void 0 : _a[0]))
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  const if_block_creators_1 = [create_if_block$1, create_if_block_1$1, create_if_block_2$1];
  const if_blocks_1 = [];
  function select_block_type_1(ctx2, dirty) {
    var _a, _b, _c;
    if (!/*value_*/
    ((_a = ctx2[14]) == null ? void 0 : _a[1]) && /*upload_count*/
    ctx2[6] === 2)
      return 0;
    if (!/*value_*/
    ((_b = ctx2[14]) == null ? void 0 : _b[1]) && /*upload_count*/
    ctx2[6] === 1)
      return 1;
    if (
      /*value_*/
      (_c = ctx2[14]) == null ? void 0 : _c[1]
    )
      return 2;
    return -1;
  }
  if (~(current_block_type_index_1 = select_block_type_1(ctx))) {
    if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
  }
  return {
    c() {
      div = element("div");
      if_block0.c();
      t = space();
      if (if_block1)
        if_block1.c();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      if_block0.l(div_nodes);
      t = claim_space(div_nodes);
      if (if_block1)
        if_block1.l(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "upload-wrap svelte-143b07a");
      toggle_class(
        div,
        "side-by-side",
        /*upload_count*/
        ctx[6] === 2
      );
      set_style(
        div,
        "display",
        /*upload_count*/
        ctx[6] === 2 ? "flex" : "block"
      );
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if_blocks[current_block_type_index].m(div, null);
      append_hydration(div, t);
      if (~current_block_type_index_1) {
        if_blocks_1[current_block_type_index_1].m(div, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block0 = if_blocks[current_block_type_index];
        if (!if_block0) {
          if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block0.c();
        } else {
          if_block0.p(ctx2, dirty);
        }
        transition_in(if_block0, 1);
        if_block0.m(div, t);
      }
      let previous_block_index_1 = current_block_type_index_1;
      current_block_type_index_1 = select_block_type_1(ctx2);
      if (current_block_type_index_1 === previous_block_index_1) {
        if (~current_block_type_index_1) {
          if_blocks_1[current_block_type_index_1].p(ctx2, dirty);
        }
      } else {
        if (if_block1) {
          group_outros();
          transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
            if_blocks_1[previous_block_index_1] = null;
          });
          check_outros();
        }
        if (~current_block_type_index_1) {
          if_block1 = if_blocks_1[current_block_type_index_1];
          if (!if_block1) {
            if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx2);
            if_block1.c();
          } else {
            if_block1.p(ctx2, dirty);
          }
          transition_in(if_block1, 1);
          if_block1.m(div, null);
        } else {
          if_block1 = null;
        }
      }
      if (!current || dirty & /*upload_count*/
      64) {
        toggle_class(
          div,
          "side-by-side",
          /*upload_count*/
          ctx2[6] === 2
        );
      }
      if (dirty & /*upload_count*/
      64) {
        set_style(
          div,
          "display",
          /*upload_count*/
          ctx2[6] === 2 ? "flex" : "block"
        );
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if_blocks[current_block_type_index].d();
      if (~current_block_type_index_1) {
        if_blocks_1[current_block_type_index_1].d();
      }
    }
  };
}
function create_fragment$2(ctx) {
  var _a, _b, _c, _d, _e, _f, _g;
  let blocklabel;
  let t0;
  let div;
  let t1;
  let t2;
  let slider;
  let updating_position;
  let div_resize_listener;
  let current;
  blocklabel = new BlockLabel({
    props: {
      show_label: (
        /*show_label*/
        ctx[4]
      ),
      Icon: Image,
      label: (
        /*label*/
        ctx[3] || /*i18n*/
        ctx[12]("image.image")
      )
    }
  });
  let if_block0 = (
    /*value*/
    (((_b = (_a = ctx[0]) == null ? void 0 : _a[0]) == null ? void 0 : _b.url) || /*value*/
    ((_d = (_c = ctx[0]) == null ? void 0 : _c[1]) == null ? void 0 : _d.url)) && create_if_block_6(ctx)
  );
  let if_block1 = (
    /*value*/
    ((_f = (_e = ctx[0]) == null ? void 0 : _e[1]) == null ? void 0 : _f.url) && create_if_block_4(ctx)
  );
  function slider_position_binding(value) {
    ctx[28](value);
  }
  let slider_props = {
    disabled: (
      /*upload_count*/
      ctx[6] == 2 || !/*value*/
      ((_g = ctx[0]) == null ? void 0 : _g[0])
    ),
    slider_color: (
      /*slider_color*/
      ctx[8]
    ),
    $$slots: { default: [create_default_slot$2] },
    $$scope: { ctx }
  };
  if (
    /*position*/
    ctx[2] !== void 0
  ) {
    slider_props.position = /*position*/
    ctx[2];
  }
  slider = new Slider({ props: slider_props });
  binding_callbacks.push(() => bind(slider, "position", slider_position_binding));
  return {
    c() {
      create_component(blocklabel.$$.fragment);
      t0 = space();
      div = element("div");
      if (if_block0)
        if_block0.c();
      t1 = space();
      if (if_block1)
        if_block1.c();
      t2 = space();
      create_component(slider.$$.fragment);
      this.h();
    },
    l(nodes) {
      claim_component(blocklabel.$$.fragment, nodes);
      t0 = claim_space(nodes);
      div = claim_element(nodes, "DIV", { "data-testid": true, class: true });
      var div_nodes = children(div);
      if (if_block0)
        if_block0.l(div_nodes);
      t1 = claim_space(div_nodes);
      if (if_block1)
        if_block1.l(div_nodes);
      t2 = claim_space(div_nodes);
      claim_component(slider.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "data-testid", "image");
      attr(div, "class", "image-container svelte-143b07a");
      add_render_callback(() => (
        /*div_elementresize_handler*/
        ctx[29].call(div)
      ));
    },
    m(target, anchor) {
      mount_component(blocklabel, target, anchor);
      insert_hydration(target, t0, anchor);
      insert_hydration(target, div, anchor);
      if (if_block0)
        if_block0.m(div, null);
      append_hydration(div, t1);
      if (if_block1)
        if_block1.m(div, null);
      append_hydration(div, t2);
      mount_component(slider, div, null);
      div_resize_listener = add_iframe_resize_listener(
        div,
        /*div_elementresize_handler*/
        ctx[29].bind(div)
      );
      current = true;
    },
    p(ctx2, [dirty]) {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2;
      const blocklabel_changes = {};
      if (dirty & /*show_label*/
      16)
        blocklabel_changes.show_label = /*show_label*/
        ctx2[4];
      if (dirty & /*label, i18n*/
      4104)
        blocklabel_changes.label = /*label*/
        ctx2[3] || /*i18n*/
        ctx2[12]("image.image");
      blocklabel.$set(blocklabel_changes);
      if (
        /*value*/
        ((_b2 = (_a2 = ctx2[0]) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.url) || /*value*/
        ((_d2 = (_c2 = ctx2[0]) == null ? void 0 : _c2[1]) == null ? void 0 : _d2.url)
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & /*value*/
          1) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_6(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div, t1);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*value*/
        (_f2 = (_e2 = ctx2[0]) == null ? void 0 : _e2[1]) == null ? void 0 : _f2.url
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*value*/
          1) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_4(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div, t2);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      const slider_changes = {};
      if (dirty & /*upload_count, value*/
      65)
        slider_changes.disabled = /*upload_count*/
        ctx2[6] == 2 || !/*value*/
        ((_g2 = ctx2[0]) == null ? void 0 : _g2[0]);
      if (dirty & /*slider_color*/
      256)
        slider_changes.slider_color = /*slider_color*/
        ctx2[8];
      if (dirty & /*$$scope, upload_count, value, root, upload, stream_handler, max_file_size, dragging, value_, el_width, position, max_height, img*/
      1073868391) {
        slider_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_position && dirty & /*position*/
      4) {
        updating_position = true;
        slider_changes.position = /*position*/
        ctx2[2];
        add_flush_callback(() => updating_position = false);
      }
      slider.$set(slider_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(blocklabel.$$.fragment, local);
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(slider.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(blocklabel.$$.fragment, local);
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(slider.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t0);
        detach(div);
      }
      destroy_component(blocklabel, detaching);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      destroy_component(slider);
      div_resize_listener();
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { value } = $$props;
  let { label = void 0 } = $$props;
  let { show_label } = $$props;
  let { root } = $$props;
  let { position } = $$props;
  let { upload_count = 2 } = $$props;
  let { show_download_button = true } = $$props;
  let { slider_color } = $$props;
  let { upload } = $$props;
  let { stream_handler } = $$props;
  let { max_file_size = null } = $$props;
  let { i18n } = $$props;
  let { max_height } = $$props;
  let value_ = value || [null, null];
  let img;
  let el_width;
  let el_height;
  async function handle_upload({ detail }, n) {
    const new_value = [value[0], value[1]];
    if (detail.length > 1) {
      new_value[n] = detail[0];
    } else {
      new_value[n] = detail[n];
    }
    $$invalidate(0, value = new_value);
    await tick();
    dispatch2("upload", new_value);
  }
  let old_value = "";
  const dispatch2 = createEventDispatcher();
  let { dragging = false } = $$props;
  const remove_image_handler = () => {
    $$invalidate(2, position = 0.5);
    $$invalidate(0, value = [null, null]);
    dispatch2("clear");
  };
  function upload_1_dragging_binding(value2) {
    dragging = value2;
    $$invalidate(1, dragging);
  }
  const load_handler = (e) => handle_upload(e, 0);
  function imageel_img_el_binding(value2) {
    img = value2;
    $$invalidate(15, img);
  }
  function upload_1_dragging_binding_1(value2) {
    dragging = value2;
    $$invalidate(1, dragging);
  }
  const load_handler_1 = (e) => handle_upload(e, 1);
  function slider_position_binding(value2) {
    position = value2;
    $$invalidate(2, position);
  }
  function div_elementresize_handler() {
    el_width = this.clientWidth;
    el_height = this.clientHeight;
    $$invalidate(16, el_width);
    $$invalidate(17, el_height);
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("label" in $$props2)
      $$invalidate(3, label = $$props2.label);
    if ("show_label" in $$props2)
      $$invalidate(4, show_label = $$props2.show_label);
    if ("root" in $$props2)
      $$invalidate(5, root = $$props2.root);
    if ("position" in $$props2)
      $$invalidate(2, position = $$props2.position);
    if ("upload_count" in $$props2)
      $$invalidate(6, upload_count = $$props2.upload_count);
    if ("show_download_button" in $$props2)
      $$invalidate(7, show_download_button = $$props2.show_download_button);
    if ("slider_color" in $$props2)
      $$invalidate(8, slider_color = $$props2.slider_color);
    if ("upload" in $$props2)
      $$invalidate(9, upload = $$props2.upload);
    if ("stream_handler" in $$props2)
      $$invalidate(10, stream_handler = $$props2.stream_handler);
    if ("max_file_size" in $$props2)
      $$invalidate(11, max_file_size = $$props2.max_file_size);
    if ("i18n" in $$props2)
      $$invalidate(12, i18n = $$props2.i18n);
    if ("max_height" in $$props2)
      $$invalidate(13, max_height = $$props2.max_height);
    if ("dragging" in $$props2)
      $$invalidate(1, dragging = $$props2.dragging);
    if ("$$scope" in $$props2)
      $$invalidate(30, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value, old_value*/
    1048577) {
      if (JSON.stringify(value) !== old_value) {
        $$invalidate(20, old_value = JSON.stringify(value));
        $$invalidate(14, value_ = value);
      }
    }
    if ($$self.$$.dirty & /*dragging*/
    2) {
      dispatch2("drag", dragging);
    }
  };
  return [
    value,
    dragging,
    position,
    label,
    show_label,
    root,
    upload_count,
    show_download_button,
    slider_color,
    upload,
    stream_handler,
    max_file_size,
    i18n,
    max_height,
    value_,
    img,
    el_width,
    el_height,
    handle_upload,
    dispatch2,
    old_value,
    slots,
    remove_image_handler,
    upload_1_dragging_binding,
    load_handler,
    imageel_img_el_binding,
    upload_1_dragging_binding_1,
    load_handler_1,
    slider_position_binding,
    div_elementresize_handler,
    $$scope
  ];
}
class Image_1 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {
      value: 0,
      label: 3,
      show_label: 4,
      root: 5,
      position: 2,
      upload_count: 6,
      show_download_button: 7,
      slider_color: 8,
      upload: 9,
      stream_handler: 10,
      max_file_size: 11,
      i18n: 12,
      max_height: 13,
      dragging: 1
    });
  }
}
function create_default_slot$1(ctx) {
  let current;
  const default_slot_template = (
    /*#slots*/
    ctx[11].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[21],
    null
  );
  return {
    c() {
      if (default_slot)
        default_slot.c();
    },
    l(nodes) {
      if (default_slot)
        default_slot.l(nodes);
    },
    m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & /*$$scope*/
        2097152)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[21],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[21]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[21],
              dirty,
              null
            ),
            null
          );
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (default_slot)
        default_slot.d(detaching);
    }
  };
}
function create_fragment$1(ctx) {
  let image;
  let updating_value;
  let updating_dragging;
  let current;
  function image_value_binding(value) {
    ctx[12](value);
  }
  function image_dragging_binding(value) {
    ctx[13](value);
  }
  let image_props = {
    slider_color: "var(--border-color-primary)",
    position: 0.5,
    root: (
      /*root*/
      ctx[7]
    ),
    label: (
      /*label*/
      ctx[4]
    ),
    show_label: (
      /*show_label*/
      ctx[5]
    ),
    upload_count: (
      /*upload_count*/
      ctx[8]
    ),
    stream_handler: (
      /*stream_handler*/
      ctx[3]
    ),
    upload: (
      /*upload*/
      ctx[2]
    ),
    max_file_size: (
      /*max_file_size*/
      ctx[10]
    ),
    max_height: (
      /*max_height*/
      ctx[9]
    ),
    i18n: (
      /*i18n*/
      ctx[6]
    ),
    $$slots: { default: [create_default_slot$1] },
    $$scope: { ctx }
  };
  if (
    /*value*/
    ctx[0] !== void 0
  ) {
    image_props.value = /*value*/
    ctx[0];
  }
  if (
    /*dragging*/
    ctx[1] !== void 0
  ) {
    image_props.dragging = /*dragging*/
    ctx[1];
  }
  image = new Image_1({ props: image_props });
  binding_callbacks.push(() => bind(image, "value", image_value_binding));
  binding_callbacks.push(() => bind(image, "dragging", image_dragging_binding));
  image.$on(
    "edit",
    /*edit_handler*/
    ctx[14]
  );
  image.$on(
    "clear",
    /*clear_handler*/
    ctx[15]
  );
  image.$on(
    "stream",
    /*stream_handler_1*/
    ctx[16]
  );
  image.$on(
    "drag",
    /*drag_handler*/
    ctx[17]
  );
  image.$on(
    "upload",
    /*upload_handler*/
    ctx[18]
  );
  image.$on(
    "select",
    /*select_handler*/
    ctx[19]
  );
  image.$on(
    "share",
    /*share_handler*/
    ctx[20]
  );
  return {
    c() {
      create_component(image.$$.fragment);
    },
    l(nodes) {
      claim_component(image.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(image, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const image_changes = {};
      if (dirty & /*root*/
      128)
        image_changes.root = /*root*/
        ctx2[7];
      if (dirty & /*label*/
      16)
        image_changes.label = /*label*/
        ctx2[4];
      if (dirty & /*show_label*/
      32)
        image_changes.show_label = /*show_label*/
        ctx2[5];
      if (dirty & /*upload_count*/
      256)
        image_changes.upload_count = /*upload_count*/
        ctx2[8];
      if (dirty & /*stream_handler*/
      8)
        image_changes.stream_handler = /*stream_handler*/
        ctx2[3];
      if (dirty & /*upload*/
      4)
        image_changes.upload = /*upload*/
        ctx2[2];
      if (dirty & /*max_file_size*/
      1024)
        image_changes.max_file_size = /*max_file_size*/
        ctx2[10];
      if (dirty & /*max_height*/
      512)
        image_changes.max_height = /*max_height*/
        ctx2[9];
      if (dirty & /*i18n*/
      64)
        image_changes.i18n = /*i18n*/
        ctx2[6];
      if (dirty & /*$$scope*/
      2097152) {
        image_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_value && dirty & /*value*/
      1) {
        updating_value = true;
        image_changes.value = /*value*/
        ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      if (!updating_dragging && dirty & /*dragging*/
      2) {
        updating_dragging = true;
        image_changes.dragging = /*dragging*/
        ctx2[1];
        add_flush_callback(() => updating_dragging = false);
      }
      image.$set(image_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(image.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(image.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(image, detaching);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { value = [null, null] } = $$props;
  let { upload } = $$props;
  let { stream_handler } = $$props;
  let { label } = $$props;
  let { show_label } = $$props;
  let { i18n } = $$props;
  let { root } = $$props;
  let { upload_count = 1 } = $$props;
  let { dragging } = $$props;
  let { max_height } = $$props;
  let { max_file_size = null } = $$props;
  function image_value_binding(value$1) {
    value = value$1;
    $$invalidate(0, value);
  }
  function image_dragging_binding(value2) {
    dragging = value2;
    $$invalidate(1, dragging);
  }
  function edit_handler(event) {
    bubble.call(this, $$self, event);
  }
  function clear_handler(event) {
    bubble.call(this, $$self, event);
  }
  function stream_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  const drag_handler = ({ detail }) => $$invalidate(1, dragging = detail);
  function upload_handler(event) {
    bubble.call(this, $$self, event);
  }
  function select_handler(event) {
    bubble.call(this, $$self, event);
  }
  function share_handler(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("upload" in $$props2)
      $$invalidate(2, upload = $$props2.upload);
    if ("stream_handler" in $$props2)
      $$invalidate(3, stream_handler = $$props2.stream_handler);
    if ("label" in $$props2)
      $$invalidate(4, label = $$props2.label);
    if ("show_label" in $$props2)
      $$invalidate(5, show_label = $$props2.show_label);
    if ("i18n" in $$props2)
      $$invalidate(6, i18n = $$props2.i18n);
    if ("root" in $$props2)
      $$invalidate(7, root = $$props2.root);
    if ("upload_count" in $$props2)
      $$invalidate(8, upload_count = $$props2.upload_count);
    if ("dragging" in $$props2)
      $$invalidate(1, dragging = $$props2.dragging);
    if ("max_height" in $$props2)
      $$invalidate(9, max_height = $$props2.max_height);
    if ("max_file_size" in $$props2)
      $$invalidate(10, max_file_size = $$props2.max_file_size);
    if ("$$scope" in $$props2)
      $$invalidate(21, $$scope = $$props2.$$scope);
  };
  return [
    value,
    dragging,
    upload,
    stream_handler,
    label,
    show_label,
    i18n,
    root,
    upload_count,
    max_height,
    max_file_size,
    slots,
    image_value_binding,
    image_dragging_binding,
    edit_handler,
    clear_handler,
    stream_handler_1,
    drag_handler,
    upload_handler,
    select_handler,
    share_handler,
    $$scope
  ];
}
class SliderUpload extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      value: 0,
      upload: 2,
      stream_handler: 3,
      label: 4,
      show_label: 5,
      i18n: 6,
      root: 7,
      upload_count: 8,
      dragging: 1,
      max_height: 9,
      max_file_size: 10
    });
  }
  get value() {
    return this.$$.ctx[0];
  }
  set value(value) {
    this.$$set({ value });
    flush();
  }
  get upload() {
    return this.$$.ctx[2];
  }
  set upload(upload) {
    this.$$set({ upload });
    flush();
  }
  get stream_handler() {
    return this.$$.ctx[3];
  }
  set stream_handler(stream_handler) {
    this.$$set({ stream_handler });
    flush();
  }
  get label() {
    return this.$$.ctx[4];
  }
  set label(label) {
    this.$$set({ label });
    flush();
  }
  get show_label() {
    return this.$$.ctx[5];
  }
  set show_label(show_label) {
    this.$$set({ show_label });
    flush();
  }
  get i18n() {
    return this.$$.ctx[6];
  }
  set i18n(i18n) {
    this.$$set({ i18n });
    flush();
  }
  get root() {
    return this.$$.ctx[7];
  }
  set root(root) {
    this.$$set({ root });
    flush();
  }
  get upload_count() {
    return this.$$.ctx[8];
  }
  set upload_count(upload_count) {
    this.$$set({ upload_count });
    flush();
  }
  get dragging() {
    return this.$$.ctx[1];
  }
  set dragging(dragging) {
    this.$$set({ dragging });
    flush();
  }
  get max_height() {
    return this.$$.ctx[9];
  }
  set max_height(max_height) {
    this.$$set({ max_height });
    flush();
  }
  get max_file_size() {
    return this.$$.ctx[10];
  }
  set max_file_size(max_file_size) {
    this.$$set({ max_file_size });
    flush();
  }
}
function create_else_block(ctx) {
  let block;
  let current;
  block = new Block({
    props: {
      visible: (
        /*visible*/
        ctx[4]
      ),
      variant: (
        /*value*/
        ctx[0] === null ? "dashed" : "solid"
      ),
      border_mode: (
        /*dragging*/
        ctx[21] ? "focus" : "base"
      ),
      padding: false,
      elem_id: (
        /*elem_id*/
        ctx[2]
      ),
      elem_classes: (
        /*elem_classes*/
        ctx[3]
      ),
      height: (
        /*height*/
        ctx[9] || void 0
      ),
      width: (
        /*width*/
        ctx[10]
      ),
      allow_overflow: false,
      container: (
        /*container*/
        ctx[11]
      ),
      scale: (
        /*scale*/
        ctx[12]
      ),
      min_width: (
        /*min_width*/
        ctx[13]
      ),
      $$slots: { default: [create_default_slot_1] },
      $$scope: { ctx }
    }
  });
  block.$on(
    "dragenter",
    /*handle_drag_event*/
    ctx[24]
  );
  block.$on(
    "dragleave",
    /*handle_drag_event*/
    ctx[24]
  );
  block.$on(
    "dragover",
    /*handle_drag_event*/
    ctx[24]
  );
  block.$on(
    "drop",
    /*handle_drop*/
    ctx[25]
  );
  return {
    c() {
      create_component(block.$$.fragment);
    },
    l(nodes) {
      claim_component(block.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(block, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const block_changes = {};
      if (dirty[0] & /*visible*/
      16)
        block_changes.visible = /*visible*/
        ctx2[4];
      if (dirty[0] & /*value*/
      1)
        block_changes.variant = /*value*/
        ctx2[0] === null ? "dashed" : "solid";
      if (dirty[0] & /*dragging*/
      2097152)
        block_changes.border_mode = /*dragging*/
        ctx2[21] ? "focus" : "base";
      if (dirty[0] & /*elem_id*/
      4)
        block_changes.elem_id = /*elem_id*/
        ctx2[2];
      if (dirty[0] & /*elem_classes*/
      8)
        block_changes.elem_classes = /*elem_classes*/
        ctx2[3];
      if (dirty[0] & /*height*/
      512)
        block_changes.height = /*height*/
        ctx2[9] || void 0;
      if (dirty[0] & /*width*/
      1024)
        block_changes.width = /*width*/
        ctx2[10];
      if (dirty[0] & /*container*/
      2048)
        block_changes.container = /*container*/
        ctx2[11];
      if (dirty[0] & /*scale*/
      4096)
        block_changes.scale = /*scale*/
        ctx2[12];
      if (dirty[0] & /*min_width*/
      8192)
        block_changes.min_width = /*min_width*/
        ctx2[13];
      if (dirty[0] & /*root, label, show_label, upload_count, gradio, max_height, upload_component, value, dragging, loading_status, placeholder*/
      8028515 | dirty[1] & /*$$scope*/
      32768) {
        block_changes.$$scope = { dirty, ctx: ctx2 };
      }
      block.$set(block_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(block.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(block.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(block, detaching);
    }
  };
}
function create_if_block(ctx) {
  let block;
  let current;
  block = new Block({
    props: {
      visible: (
        /*visible*/
        ctx[4]
      ),
      variant: "solid",
      border_mode: (
        /*dragging*/
        ctx[21] ? "focus" : "base"
      ),
      padding: false,
      elem_id: (
        /*elem_id*/
        ctx[2]
      ),
      elem_classes: (
        /*elem_classes*/
        ctx[3]
      ),
      height: (
        /*height*/
        ctx[9] || void 0
      ),
      width: (
        /*width*/
        ctx[10]
      ),
      allow_overflow: false,
      container: (
        /*container*/
        ctx[11]
      ),
      scale: (
        /*scale*/
        ctx[12]
      ),
      min_width: (
        /*min_width*/
        ctx[13]
      ),
      $$slots: { default: [create_default_slot] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(block.$$.fragment);
    },
    l(nodes) {
      claim_component(block.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(block, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const block_changes = {};
      if (dirty[0] & /*visible*/
      16)
        block_changes.visible = /*visible*/
        ctx2[4];
      if (dirty[0] & /*dragging*/
      2097152)
        block_changes.border_mode = /*dragging*/
        ctx2[21] ? "focus" : "base";
      if (dirty[0] & /*elem_id*/
      4)
        block_changes.elem_id = /*elem_id*/
        ctx2[2];
      if (dirty[0] & /*elem_classes*/
      8)
        block_changes.elem_classes = /*elem_classes*/
        ctx2[3];
      if (dirty[0] & /*height*/
      512)
        block_changes.height = /*height*/
        ctx2[9] || void 0;
      if (dirty[0] & /*width*/
      1024)
        block_changes.width = /*width*/
        ctx2[10];
      if (dirty[0] & /*container*/
      2048)
        block_changes.container = /*container*/
        ctx2[11];
      if (dirty[0] & /*scale*/
      4096)
        block_changes.scale = /*scale*/
        ctx2[12];
      if (dirty[0] & /*min_width*/
      8192)
        block_changes.min_width = /*min_width*/
        ctx2[13];
      if (dirty[0] & /*interactive, label, show_label, show_download_button, gradio, show_fullscreen_button, normalised_slider_position, slider_color, max_height, value, loading_status*/
      10305763 | dirty[1] & /*$$scope*/
      32768) {
        block_changes.$$scope = { dirty, ctx: ctx2 };
      }
      block.$set(block_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(block.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(block.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(block, detaching);
    }
  };
}
function create_else_block_1(ctx) {
  let empty_1;
  let current;
  empty_1 = new Empty({
    props: {
      unpadded_box: true,
      size: "large",
      $$slots: { default: [create_default_slot_3] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(empty_1.$$.fragment);
    },
    l(nodes) {
      claim_component(empty_1.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(empty_1, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const empty_1_changes = {};
      if (dirty[1] & /*$$scope*/
      32768) {
        empty_1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      empty_1.$set(empty_1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(empty_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(empty_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(empty_1, detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let uploadtext;
  let current;
  uploadtext = new UploadText({
    props: {
      i18n: (
        /*gradio*/
        ctx[20].i18n
      ),
      type: "clipboard",
      mode: "short"
    }
  });
  return {
    c() {
      create_component(uploadtext.$$.fragment);
    },
    l(nodes) {
      claim_component(uploadtext.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(uploadtext, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const uploadtext_changes = {};
      if (dirty[0] & /*gradio*/
      1048576)
        uploadtext_changes.i18n = /*gradio*/
        ctx2[20].i18n;
      uploadtext.$set(uploadtext_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(uploadtext.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(uploadtext.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(uploadtext, detaching);
    }
  };
}
function create_if_block_1(ctx) {
  let uploadtext;
  let current;
  uploadtext = new UploadText({
    props: {
      i18n: (
        /*gradio*/
        ctx[20].i18n
      ),
      type: "image",
      placeholder: (
        /*placeholder*/
        ctx[15]
      )
    }
  });
  return {
    c() {
      create_component(uploadtext.$$.fragment);
    },
    l(nodes) {
      claim_component(uploadtext.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(uploadtext, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const uploadtext_changes = {};
      if (dirty[0] & /*gradio*/
      1048576)
        uploadtext_changes.i18n = /*gradio*/
        ctx2[20].i18n;
      if (dirty[0] & /*placeholder*/
      32768)
        uploadtext_changes.placeholder = /*placeholder*/
        ctx2[15];
      uploadtext.$set(uploadtext_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(uploadtext.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(uploadtext.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(uploadtext, detaching);
    }
  };
}
function create_default_slot_3(ctx) {
  let image;
  let current;
  image = new Image({});
  return {
    c() {
      create_component(image.$$.fragment);
    },
    l(nodes) {
      claim_component(image.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(image, target, anchor);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(image.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(image.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(image, detaching);
    }
  };
}
function create_default_slot_2(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block_1];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    return 0;
  }
  current_block_type_index = select_block_type_1();
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if_block.p(ctx2, dirty);
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if_blocks[current_block_type_index].d(detaching);
    }
  };
}
function create_default_slot_1(ctx) {
  var _a;
  let statustracker;
  let t;
  let imageuploader;
  let updating_value;
  let updating_dragging;
  let current;
  const statustracker_spread_levels = [
    {
      autoscroll: (
        /*gradio*/
        ctx[20].autoscroll
      )
    },
    { i18n: (
      /*gradio*/
      ctx[20].i18n
    ) },
    /*loading_status*/
    ctx[1]
  ];
  let statustracker_props = {};
  for (let i = 0; i < statustracker_spread_levels.length; i += 1) {
    statustracker_props = assign(statustracker_props, statustracker_spread_levels[i]);
  }
  statustracker = new Static({ props: statustracker_props });
  statustracker.$on(
    "clear_status",
    /*clear_status_handler*/
    ctx[35]
  );
  function imageuploader_value_binding(value) {
    ctx[38](value);
  }
  function imageuploader_dragging_binding(value) {
    ctx[39](value);
  }
  let imageuploader_props = {
    root: (
      /*root*/
      ctx[8]
    ),
    label: (
      /*label*/
      ctx[5]
    ),
    show_label: (
      /*show_label*/
      ctx[6]
    ),
    upload_count: (
      /*upload_count*/
      ctx[17]
    ),
    max_file_size: (
      /*gradio*/
      ctx[20].max_file_size
    ),
    i18n: (
      /*gradio*/
      ctx[20].i18n
    ),
    upload: (
      /*func*/
      ctx[36]
    ),
    stream_handler: (
      /*gradio*/
      (_a = ctx[20].client) == null ? void 0 : _a.stream
    ),
    max_height: (
      /*max_height*/
      ctx[19]
    ),
    $$slots: { default: [create_default_slot_2] },
    $$scope: { ctx }
  };
  if (
    /*value*/
    ctx[0] !== void 0
  ) {
    imageuploader_props.value = /*value*/
    ctx[0];
  }
  if (
    /*dragging*/
    ctx[21] !== void 0
  ) {
    imageuploader_props.dragging = /*dragging*/
    ctx[21];
  }
  imageuploader = new SliderUpload({ props: imageuploader_props });
  ctx[37](imageuploader);
  binding_callbacks.push(() => bind(imageuploader, "value", imageuploader_value_binding));
  binding_callbacks.push(() => bind(imageuploader, "dragging", imageuploader_dragging_binding));
  imageuploader.$on(
    "edit",
    /*edit_handler*/
    ctx[40]
  );
  imageuploader.$on(
    "clear",
    /*clear_handler_1*/
    ctx[41]
  );
  imageuploader.$on(
    "drag",
    /*drag_handler*/
    ctx[42]
  );
  imageuploader.$on(
    "upload",
    /*upload_handler*/
    ctx[43]
  );
  imageuploader.$on(
    "error",
    /*error_handler_1*/
    ctx[44]
  );
  imageuploader.$on(
    "close_stream",
    /*close_stream_handler*/
    ctx[45]
  );
  return {
    c() {
      create_component(statustracker.$$.fragment);
      t = space();
      create_component(imageuploader.$$.fragment);
    },
    l(nodes) {
      claim_component(statustracker.$$.fragment, nodes);
      t = claim_space(nodes);
      claim_component(imageuploader.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(statustracker, target, anchor);
      insert_hydration(target, t, anchor);
      mount_component(imageuploader, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2;
      const statustracker_changes = dirty[0] & /*gradio, loading_status*/
      1048578 ? get_spread_update(statustracker_spread_levels, [
        dirty[0] & /*gradio*/
        1048576 && {
          autoscroll: (
            /*gradio*/
            ctx2[20].autoscroll
          )
        },
        dirty[0] & /*gradio*/
        1048576 && { i18n: (
          /*gradio*/
          ctx2[20].i18n
        ) },
        dirty[0] & /*loading_status*/
        2 && get_spread_object(
          /*loading_status*/
          ctx2[1]
        )
      ]) : {};
      statustracker.$set(statustracker_changes);
      const imageuploader_changes = {};
      if (dirty[0] & /*root*/
      256)
        imageuploader_changes.root = /*root*/
        ctx2[8];
      if (dirty[0] & /*label*/
      32)
        imageuploader_changes.label = /*label*/
        ctx2[5];
      if (dirty[0] & /*show_label*/
      64)
        imageuploader_changes.show_label = /*show_label*/
        ctx2[6];
      if (dirty[0] & /*upload_count*/
      131072)
        imageuploader_changes.upload_count = /*upload_count*/
        ctx2[17];
      if (dirty[0] & /*gradio*/
      1048576)
        imageuploader_changes.max_file_size = /*gradio*/
        ctx2[20].max_file_size;
      if (dirty[0] & /*gradio*/
      1048576)
        imageuploader_changes.i18n = /*gradio*/
        ctx2[20].i18n;
      if (dirty[0] & /*gradio*/
      1048576)
        imageuploader_changes.upload = /*func*/
        ctx2[36];
      if (dirty[0] & /*gradio*/
      1048576)
        imageuploader_changes.stream_handler = /*gradio*/
        (_a2 = ctx2[20].client) == null ? void 0 : _a2.stream;
      if (dirty[0] & /*max_height*/
      524288)
        imageuploader_changes.max_height = /*max_height*/
        ctx2[19];
      if (dirty[0] & /*gradio, placeholder*/
      1081344 | dirty[1] & /*$$scope*/
      32768) {
        imageuploader_changes.$$scope = { dirty, ctx: ctx2 };
      }
      if (!updating_value && dirty[0] & /*value*/
      1) {
        updating_value = true;
        imageuploader_changes.value = /*value*/
        ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      if (!updating_dragging && dirty[0] & /*dragging*/
      2097152) {
        updating_dragging = true;
        imageuploader_changes.dragging = /*dragging*/
        ctx2[21];
        add_flush_callback(() => updating_dragging = false);
      }
      imageuploader.$set(imageuploader_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(statustracker.$$.fragment, local);
      transition_in(imageuploader.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(statustracker.$$.fragment, local);
      transition_out(imageuploader.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t);
      }
      destroy_component(statustracker, detaching);
      ctx[37](null);
      destroy_component(imageuploader, detaching);
    }
  };
}
function create_default_slot(ctx) {
  let statustracker;
  let t;
  let staticimage;
  let updating_value;
  let current;
  const statustracker_spread_levels = [
    {
      autoscroll: (
        /*gradio*/
        ctx[20].autoscroll
      )
    },
    { i18n: (
      /*gradio*/
      ctx[20].i18n
    ) },
    /*loading_status*/
    ctx[1]
  ];
  let statustracker_props = {};
  for (let i = 0; i < statustracker_spread_levels.length; i += 1) {
    statustracker_props = assign(statustracker_props, statustracker_spread_levels[i]);
  }
  statustracker = new Static({ props: statustracker_props });
  function staticimage_value_binding(value) {
    ctx[30](value);
  }
  let staticimage_props = {
    interactive: (
      /*interactive*/
      ctx[14]
    ),
    label: (
      /*label*/
      ctx[5]
    ),
    show_label: (
      /*show_label*/
      ctx[6]
    ),
    show_download_button: (
      /*show_download_button*/
      ctx[7]
    ),
    i18n: (
      /*gradio*/
      ctx[20].i18n
    ),
    show_fullscreen_button: (
      /*show_fullscreen_button*/
      ctx[16]
    ),
    position: (
      /*normalised_slider_position*/
      ctx[23]
    ),
    slider_color: (
      /*slider_color*/
      ctx[18]
    ),
    max_height: (
      /*max_height*/
      ctx[19]
    )
  };
  if (
    /*value*/
    ctx[0] !== void 0
  ) {
    staticimage_props.value = /*value*/
    ctx[0];
  }
  staticimage = new SliderPreview({ props: staticimage_props });
  binding_callbacks.push(() => bind(staticimage, "value", staticimage_value_binding));
  staticimage.$on(
    "select",
    /*select_handler*/
    ctx[31]
  );
  staticimage.$on(
    "share",
    /*share_handler*/
    ctx[32]
  );
  staticimage.$on(
    "error",
    /*error_handler*/
    ctx[33]
  );
  staticimage.$on(
    "clear",
    /*clear_handler*/
    ctx[34]
  );
  return {
    c() {
      create_component(statustracker.$$.fragment);
      t = space();
      create_component(staticimage.$$.fragment);
    },
    l(nodes) {
      claim_component(statustracker.$$.fragment, nodes);
      t = claim_space(nodes);
      claim_component(staticimage.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(statustracker, target, anchor);
      insert_hydration(target, t, anchor);
      mount_component(staticimage, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const statustracker_changes = dirty[0] & /*gradio, loading_status*/
      1048578 ? get_spread_update(statustracker_spread_levels, [
        dirty[0] & /*gradio*/
        1048576 && {
          autoscroll: (
            /*gradio*/
            ctx2[20].autoscroll
          )
        },
        dirty[0] & /*gradio*/
        1048576 && { i18n: (
          /*gradio*/
          ctx2[20].i18n
        ) },
        dirty[0] & /*loading_status*/
        2 && get_spread_object(
          /*loading_status*/
          ctx2[1]
        )
      ]) : {};
      statustracker.$set(statustracker_changes);
      const staticimage_changes = {};
      if (dirty[0] & /*interactive*/
      16384)
        staticimage_changes.interactive = /*interactive*/
        ctx2[14];
      if (dirty[0] & /*label*/
      32)
        staticimage_changes.label = /*label*/
        ctx2[5];
      if (dirty[0] & /*show_label*/
      64)
        staticimage_changes.show_label = /*show_label*/
        ctx2[6];
      if (dirty[0] & /*show_download_button*/
      128)
        staticimage_changes.show_download_button = /*show_download_button*/
        ctx2[7];
      if (dirty[0] & /*gradio*/
      1048576)
        staticimage_changes.i18n = /*gradio*/
        ctx2[20].i18n;
      if (dirty[0] & /*show_fullscreen_button*/
      65536)
        staticimage_changes.show_fullscreen_button = /*show_fullscreen_button*/
        ctx2[16];
      if (dirty[0] & /*normalised_slider_position*/
      8388608)
        staticimage_changes.position = /*normalised_slider_position*/
        ctx2[23];
      if (dirty[0] & /*slider_color*/
      262144)
        staticimage_changes.slider_color = /*slider_color*/
        ctx2[18];
      if (dirty[0] & /*max_height*/
      524288)
        staticimage_changes.max_height = /*max_height*/
        ctx2[19];
      if (!updating_value && dirty[0] & /*value*/
      1) {
        updating_value = true;
        staticimage_changes.value = /*value*/
        ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      staticimage.$set(staticimage_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(statustracker.$$.fragment, local);
      transition_in(staticimage.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(statustracker.$$.fragment, local);
      transition_out(staticimage.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(t);
      }
      destroy_component(statustracker, detaching);
      destroy_component(staticimage, detaching);
    }
  };
}
function create_fragment(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    var _a, _b;
    if (!/*interactive*/
    ctx2[14] || /*value*/
    ((_a = ctx2[0]) == null ? void 0 : _a[1]) && /*value*/
    ((_b = ctx2[0]) == null ? void 0 : _b[0]))
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if_blocks[current_block_type_index].d(detaching);
    }
  };
}
let uploading = false;
function instance($$self, $$props, $$invalidate) {
  let normalised_slider_position;
  let { value_is_output = false } = $$props;
  let { elem_id = "" } = $$props;
  let { elem_classes = [] } = $$props;
  let { visible = true } = $$props;
  let { value = [null, null] } = $$props;
  let old_value = [null, null];
  let { label } = $$props;
  let { show_label } = $$props;
  let { show_download_button } = $$props;
  let { root } = $$props;
  let { height } = $$props;
  let { width } = $$props;
  let { container = true } = $$props;
  let { scale = null } = $$props;
  let { min_width = void 0 } = $$props;
  let { loading_status } = $$props;
  let { interactive } = $$props;
  let { placeholder = void 0 } = $$props;
  let { show_fullscreen_button } = $$props;
  let { input_ready } = $$props;
  let { slider_position } = $$props;
  let { upload_count = 1 } = $$props;
  let { slider_color = "var(--border-color-primary)" } = $$props;
  let { max_height } = $$props;
  let { gradio } = $$props;
  afterUpdate(() => {
    $$invalidate(26, value_is_output = false);
  });
  let dragging;
  let upload_component;
  const handle_drag_event = (event) => {
    const drag_event = event;
    drag_event.preventDefault();
    drag_event.stopPropagation();
    if (drag_event.type === "dragenter" || drag_event.type === "dragover") {
      $$invalidate(21, dragging = true);
    } else if (drag_event.type === "dragleave") {
      $$invalidate(21, dragging = false);
    }
  };
  const handle_drop = (event) => {
    if (interactive) {
      const drop_event = event;
      drop_event.preventDefault();
      drop_event.stopPropagation();
      $$invalidate(21, dragging = false);
      if (upload_component) {
        upload_component.loadFilesFromDrop(drop_event);
      }
    }
  };
  function staticimage_value_binding(value$1) {
    value = value$1;
    $$invalidate(0, value);
  }
  const select_handler = ({ detail }) => gradio.dispatch("select", detail);
  const share_handler = ({ detail }) => gradio.dispatch("share", detail);
  const error_handler = ({ detail }) => gradio.dispatch("error", detail);
  const clear_handler = () => gradio.dispatch("clear");
  const clear_status_handler = () => gradio.dispatch("clear_status", loading_status);
  const func = (...args) => gradio.client.upload(...args);
  function imageuploader_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      upload_component = $$value;
      $$invalidate(22, upload_component);
    });
  }
  function imageuploader_value_binding(value$1) {
    value = value$1;
    $$invalidate(0, value);
  }
  function imageuploader_dragging_binding(value2) {
    dragging = value2;
    $$invalidate(21, dragging);
  }
  const edit_handler = () => gradio.dispatch("edit");
  const clear_handler_1 = () => {
    gradio.dispatch("clear");
  };
  const drag_handler = ({ detail }) => $$invalidate(21, dragging = detail);
  const upload_handler = () => gradio.dispatch("upload");
  const error_handler_1 = ({ detail }) => {
    $$invalidate(1, loading_status = loading_status || {});
    $$invalidate(1, loading_status.status = "error", loading_status);
    gradio.dispatch("error", detail);
  };
  const close_stream_handler = () => {
    gradio.dispatch("close_stream", "stream");
  };
  $$self.$$set = ($$props2) => {
    if ("value_is_output" in $$props2)
      $$invalidate(26, value_is_output = $$props2.value_is_output);
    if ("elem_id" in $$props2)
      $$invalidate(2, elem_id = $$props2.elem_id);
    if ("elem_classes" in $$props2)
      $$invalidate(3, elem_classes = $$props2.elem_classes);
    if ("visible" in $$props2)
      $$invalidate(4, visible = $$props2.visible);
    if ("value" in $$props2)
      $$invalidate(0, value = $$props2.value);
    if ("label" in $$props2)
      $$invalidate(5, label = $$props2.label);
    if ("show_label" in $$props2)
      $$invalidate(6, show_label = $$props2.show_label);
    if ("show_download_button" in $$props2)
      $$invalidate(7, show_download_button = $$props2.show_download_button);
    if ("root" in $$props2)
      $$invalidate(8, root = $$props2.root);
    if ("height" in $$props2)
      $$invalidate(9, height = $$props2.height);
    if ("width" in $$props2)
      $$invalidate(10, width = $$props2.width);
    if ("container" in $$props2)
      $$invalidate(11, container = $$props2.container);
    if ("scale" in $$props2)
      $$invalidate(12, scale = $$props2.scale);
    if ("min_width" in $$props2)
      $$invalidate(13, min_width = $$props2.min_width);
    if ("loading_status" in $$props2)
      $$invalidate(1, loading_status = $$props2.loading_status);
    if ("interactive" in $$props2)
      $$invalidate(14, interactive = $$props2.interactive);
    if ("placeholder" in $$props2)
      $$invalidate(15, placeholder = $$props2.placeholder);
    if ("show_fullscreen_button" in $$props2)
      $$invalidate(16, show_fullscreen_button = $$props2.show_fullscreen_button);
    if ("input_ready" in $$props2)
      $$invalidate(27, input_ready = $$props2.input_ready);
    if ("slider_position" in $$props2)
      $$invalidate(28, slider_position = $$props2.slider_position);
    if ("upload_count" in $$props2)
      $$invalidate(17, upload_count = $$props2.upload_count);
    if ("slider_color" in $$props2)
      $$invalidate(18, slider_color = $$props2.slider_color);
    if ("max_height" in $$props2)
      $$invalidate(19, max_height = $$props2.max_height);
    if ("gradio" in $$props2)
      $$invalidate(20, gradio = $$props2.gradio);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*slider_position*/
    268435456) {
      $$invalidate(23, normalised_slider_position = Math.max(0, Math.min(100, slider_position)) / 100);
    }
    if ($$self.$$.dirty[0] & /*value, old_value, gradio, value_is_output*/
    605028353) {
      {
        if (JSON.stringify(value) !== JSON.stringify(old_value)) {
          $$invalidate(29, old_value = value);
          gradio.dispatch("change");
          if (!value_is_output) {
            gradio.dispatch("input");
          }
        }
      }
    }
  };
  $$invalidate(27, input_ready = !uploading);
  return [
    value,
    loading_status,
    elem_id,
    elem_classes,
    visible,
    label,
    show_label,
    show_download_button,
    root,
    height,
    width,
    container,
    scale,
    min_width,
    interactive,
    placeholder,
    show_fullscreen_button,
    upload_count,
    slider_color,
    max_height,
    gradio,
    dragging,
    upload_component,
    normalised_slider_position,
    handle_drag_event,
    handle_drop,
    value_is_output,
    input_ready,
    slider_position,
    old_value,
    staticimage_value_binding,
    select_handler,
    share_handler,
    error_handler,
    clear_handler,
    clear_status_handler,
    func,
    imageuploader_binding,
    imageuploader_value_binding,
    imageuploader_dragging_binding,
    edit_handler,
    clear_handler_1,
    drag_handler,
    upload_handler,
    error_handler_1,
    close_stream_handler
  ];
}
class Index extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance,
      create_fragment,
      safe_not_equal,
      {
        value_is_output: 26,
        elem_id: 2,
        elem_classes: 3,
        visible: 4,
        value: 0,
        label: 5,
        show_label: 6,
        show_download_button: 7,
        root: 8,
        height: 9,
        width: 10,
        container: 11,
        scale: 12,
        min_width: 13,
        loading_status: 1,
        interactive: 14,
        placeholder: 15,
        show_fullscreen_button: 16,
        input_ready: 27,
        slider_position: 28,
        upload_count: 17,
        slider_color: 18,
        max_height: 19,
        gradio: 20
      },
      null,
      [-1, -1]
    );
  }
  get value_is_output() {
    return this.$$.ctx[26];
  }
  set value_is_output(value_is_output) {
    this.$$set({ value_is_output });
    flush();
  }
  get elem_id() {
    return this.$$.ctx[2];
  }
  set elem_id(elem_id) {
    this.$$set({ elem_id });
    flush();
  }
  get elem_classes() {
    return this.$$.ctx[3];
  }
  set elem_classes(elem_classes) {
    this.$$set({ elem_classes });
    flush();
  }
  get visible() {
    return this.$$.ctx[4];
  }
  set visible(visible) {
    this.$$set({ visible });
    flush();
  }
  get value() {
    return this.$$.ctx[0];
  }
  set value(value) {
    this.$$set({ value });
    flush();
  }
  get label() {
    return this.$$.ctx[5];
  }
  set label(label) {
    this.$$set({ label });
    flush();
  }
  get show_label() {
    return this.$$.ctx[6];
  }
  set show_label(show_label) {
    this.$$set({ show_label });
    flush();
  }
  get show_download_button() {
    return this.$$.ctx[7];
  }
  set show_download_button(show_download_button) {
    this.$$set({ show_download_button });
    flush();
  }
  get root() {
    return this.$$.ctx[8];
  }
  set root(root) {
    this.$$set({ root });
    flush();
  }
  get height() {
    return this.$$.ctx[9];
  }
  set height(height) {
    this.$$set({ height });
    flush();
  }
  get width() {
    return this.$$.ctx[10];
  }
  set width(width) {
    this.$$set({ width });
    flush();
  }
  get container() {
    return this.$$.ctx[11];
  }
  set container(container) {
    this.$$set({ container });
    flush();
  }
  get scale() {
    return this.$$.ctx[12];
  }
  set scale(scale) {
    this.$$set({ scale });
    flush();
  }
  get min_width() {
    return this.$$.ctx[13];
  }
  set min_width(min_width) {
    this.$$set({ min_width });
    flush();
  }
  get loading_status() {
    return this.$$.ctx[1];
  }
  set loading_status(loading_status) {
    this.$$set({ loading_status });
    flush();
  }
  get interactive() {
    return this.$$.ctx[14];
  }
  set interactive(interactive) {
    this.$$set({ interactive });
    flush();
  }
  get placeholder() {
    return this.$$.ctx[15];
  }
  set placeholder(placeholder) {
    this.$$set({ placeholder });
    flush();
  }
  get show_fullscreen_button() {
    return this.$$.ctx[16];
  }
  set show_fullscreen_button(show_fullscreen_button) {
    this.$$set({ show_fullscreen_button });
    flush();
  }
  get input_ready() {
    return this.$$.ctx[27];
  }
  set input_ready(input_ready) {
    this.$$set({ input_ready });
    flush();
  }
  get slider_position() {
    return this.$$.ctx[28];
  }
  set slider_position(slider_position) {
    this.$$set({ slider_position });
    flush();
  }
  get upload_count() {
    return this.$$.ctx[17];
  }
  set upload_count(upload_count) {
    this.$$set({ upload_count });
    flush();
  }
  get slider_color() {
    return this.$$.ctx[18];
  }
  set slider_color(slider_color) {
    this.$$set({ slider_color });
    flush();
  }
  get max_height() {
    return this.$$.ctx[19];
  }
  set max_height(max_height) {
    this.$$set({ max_height });
    flush();
  }
  get gradio() {
    return this.$$.ctx[20];
  }
  set gradio(gradio) {
    this.$$set({ gradio });
    flush();
  }
}
export {
  Index as default
};
