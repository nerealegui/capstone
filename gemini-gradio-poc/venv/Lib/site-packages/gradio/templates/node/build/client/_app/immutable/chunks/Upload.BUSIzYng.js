import { SvelteComponent, init, safe_not_equal, svg_element, claim_svg_element, children, detach, attr, insert_hydration, append_hydration, noop, element, text, space, claim_element, claim_text, claim_space, toggle_class, set_data, createEventDispatcher, onMount, onDestroy, set_style, empty, group_outros, transition_out, check_outros, transition_in, create_slot, action_destroyer, update_slot_base, get_all_dirty_from_scope, get_slot_changes, is_function, listen, create_component, claim_component, mount_component, destroy_component, tick } from "../../../svelte/svelte.js";
import "../../../svelte/svelte-submodules.js";
import { F as prepare_files } from "./2.D3x_Usqw.js";
/* empty css                                              */
function create_fragment$3(ctx) {
  let svg;
  let path;
  return {
    c() {
      svg = svg_element("svg");
      path = svg_element("path");
      this.h();
    },
    l(nodes) {
      svg = claim_svg_element(nodes, "svg", {
        xmlns: true,
        width: true,
        height: true,
        viewBox: true
      });
      var svg_nodes = children(svg);
      path = claim_svg_element(svg_nodes, "path", { fill: true, d: true });
      children(path).forEach(detach);
      svg_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(path, "fill", "currentColor");
      attr(path, "d", "M200 32h-36.26a47.92 47.92 0 0 0-71.48 0H56a16 16 0 0 0-16 16v168a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m-72 0a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32m72 184H56V48h26.75A47.9 47.9 0 0 0 80 64v8a8 8 0 0 0 8 8h80a8 8 0 0 0 8-8v-8a47.9 47.9 0 0 0-2.75-16H200Z");
      attr(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr(svg, "width", "100%");
      attr(svg, "height", "100%");
      attr(svg, "viewBox", "0 0 256 256");
    },
    m(target, anchor) {
      insert_hydration(target, svg, anchor);
      append_hydration(svg, path);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(svg);
      }
    }
  };
}
class ImagePaste extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, null, create_fragment$3, safe_not_equal, {});
  }
}
function create_fragment$2(ctx) {
  let svg;
  let path;
  let polyline;
  let line;
  return {
    c() {
      svg = svg_element("svg");
      path = svg_element("path");
      polyline = svg_element("polyline");
      line = svg_element("line");
      this.h();
    },
    l(nodes) {
      svg = claim_svg_element(nodes, "svg", {
        xmlns: true,
        width: true,
        height: true,
        viewBox: true,
        fill: true,
        stroke: true,
        "stroke-width": true,
        "stroke-linecap": true,
        "stroke-linejoin": true,
        class: true
      });
      var svg_nodes = children(svg);
      path = claim_svg_element(svg_nodes, "path", { d: true });
      children(path).forEach(detach);
      polyline = claim_svg_element(svg_nodes, "polyline", { points: true });
      children(polyline).forEach(detach);
      line = claim_svg_element(svg_nodes, "line", { x1: true, y1: true, x2: true, y2: true });
      children(line).forEach(detach);
      svg_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(path, "d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4");
      attr(polyline, "points", "17 8 12 3 7 8");
      attr(line, "x1", "12");
      attr(line, "y1", "3");
      attr(line, "x2", "12");
      attr(line, "y2", "15");
      attr(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr(svg, "width", "90%");
      attr(svg, "height", "90%");
      attr(svg, "viewBox", "0 0 24 24");
      attr(svg, "fill", "none");
      attr(svg, "stroke", "currentColor");
      attr(svg, "stroke-width", "2");
      attr(svg, "stroke-linecap", "round");
      attr(svg, "stroke-linejoin", "round");
      attr(svg, "class", "feather feather-upload");
    },
    m(target, anchor) {
      insert_hydration(target, svg, anchor);
      append_hydration(svg, path);
      append_hydration(svg, polyline);
      append_hydration(svg, line);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(svg);
      }
    }
  };
}
let Upload$1 = class Upload extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, null, create_fragment$2, safe_not_equal, {});
  }
};
function create_if_block$1(ctx) {
  let div1;
  let span0;
  let div0;
  let progress_1;
  let t0_value = getProgress(
    /*file_to_display*/
    ctx[2]
  ) + "";
  let t0;
  let progress_1_value_value;
  let t1;
  let span1;
  let t2_value = (
    /*file_to_display*/
    ctx[2].orig_name + ""
  );
  let t2;
  return {
    c() {
      div1 = element("div");
      span0 = element("span");
      div0 = element("div");
      progress_1 = element("progress");
      t0 = text(t0_value);
      t1 = space();
      span1 = element("span");
      t2 = text(t2_value);
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      span0 = claim_element(div1_nodes, "SPAN", {});
      var span0_nodes = children(span0);
      div0 = claim_element(span0_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      progress_1 = claim_element(div0_nodes, "PROGRESS", { style: true, max: true, class: true });
      var progress_1_nodes = children(progress_1);
      t0 = claim_text(progress_1_nodes, t0_value);
      progress_1_nodes.forEach(detach);
      div0_nodes.forEach(detach);
      span0_nodes.forEach(detach);
      t1 = claim_space(div1_nodes);
      span1 = claim_element(div1_nodes, "SPAN", { class: true });
      var span1_nodes = children(span1);
      t2 = claim_text(span1_nodes, t2_value);
      span1_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      set_style(progress_1, "visibility", "hidden");
      set_style(progress_1, "height", "0");
      set_style(progress_1, "width", "0");
      progress_1.value = progress_1_value_value = getProgress(
        /*file_to_display*/
        ctx[2]
      );
      attr(progress_1, "max", "100");
      attr(progress_1, "class", "svelte-1vsfomn");
      attr(div0, "class", "progress-bar svelte-1vsfomn");
      attr(span1, "class", "file-name svelte-1vsfomn");
      attr(div1, "class", "file svelte-1vsfomn");
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      append_hydration(div1, span0);
      append_hydration(span0, div0);
      append_hydration(div0, progress_1);
      append_hydration(progress_1, t0);
      append_hydration(div1, t1);
      append_hydration(div1, span1);
      append_hydration(span1, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*file_to_display*/
      4 && t0_value !== (t0_value = getProgress(
        /*file_to_display*/
        ctx2[2]
      ) + ""))
        set_data(t0, t0_value);
      if (dirty & /*file_to_display*/
      4 && progress_1_value_value !== (progress_1_value_value = getProgress(
        /*file_to_display*/
        ctx2[2]
      ))) {
        progress_1.value = progress_1_value_value;
      }
      if (dirty & /*file_to_display*/
      4 && t2_value !== (t2_value = /*file_to_display*/
      ctx2[2].orig_name + ""))
        set_data(t2, t2_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
    }
  };
}
function create_fragment$1(ctx) {
  let div;
  let span;
  let t0;
  let t1_value = (
    /*files_with_progress*/
    ctx[0].length + ""
  );
  let t1;
  let t2;
  let t3_value = (
    /*files_with_progress*/
    ctx[0].length > 1 ? "files" : "file"
  );
  let t3;
  let t4;
  let t5;
  let if_block = (
    /*file_to_display*/
    ctx[2] && create_if_block$1(ctx)
  );
  return {
    c() {
      div = element("div");
      span = element("span");
      t0 = text("Uploading ");
      t1 = text(t1_value);
      t2 = space();
      t3 = text(t3_value);
      t4 = text("...");
      t5 = space();
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      span = claim_element(div_nodes, "SPAN", { class: true });
      var span_nodes = children(span);
      t0 = claim_text(span_nodes, "Uploading ");
      t1 = claim_text(span_nodes, t1_value);
      t2 = claim_space(span_nodes);
      t3 = claim_text(span_nodes, t3_value);
      t4 = claim_text(span_nodes, "...");
      span_nodes.forEach(detach);
      t5 = claim_space(div_nodes);
      if (if_block)
        if_block.l(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(span, "class", "uploading svelte-1vsfomn");
      attr(div, "class", "wrap svelte-1vsfomn");
      toggle_class(
        div,
        "progress",
        /*progress*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, span);
      append_hydration(span, t0);
      append_hydration(span, t1);
      append_hydration(span, t2);
      append_hydration(span, t3);
      append_hydration(span, t4);
      append_hydration(div, t5);
      if (if_block)
        if_block.m(div, null);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*files_with_progress*/
      1 && t1_value !== (t1_value = /*files_with_progress*/
      ctx2[0].length + ""))
        set_data(t1, t1_value);
      if (dirty & /*files_with_progress*/
      1 && t3_value !== (t3_value = /*files_with_progress*/
      ctx2[0].length > 1 ? "files" : "file"))
        set_data(t3, t3_value);
      if (
        /*file_to_display*/
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$1(ctx2);
          if_block.c();
          if_block.m(div, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*progress*/
      2) {
        toggle_class(
          div,
          "progress",
          /*progress*/
          ctx2[1]
        );
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block)
        if_block.d();
    }
  };
}
function getProgress(file) {
  return file.progress * 100 / (file.size || 0) || 0;
}
function calculateTotalProgress(files2) {
  let totalProgress = 0;
  files2.forEach((file) => {
    totalProgress += getProgress(file);
  });
  document.documentElement.style.setProperty("--upload-progress-width", (totalProgress / files2.length).toFixed(2) + "%");
  return totalProgress / files2.length;
}
function instance$1($$self, $$props, $$invalidate) {
  let { upload_id } = $$props;
  let { root } = $$props;
  let { files } = $$props;
  let { stream_handler } = $$props;
  let stream;
  let progress = false;
  let current_file_upload;
  let file_to_display;
  let files_with_progress = files.map((file) => {
    return { ...file, progress: 0 };
  });
  const dispatch = createEventDispatcher();
  function handleProgress(filename, chunk_size) {
    $$invalidate(0, files_with_progress = files_with_progress.map((file) => {
      if (file.orig_name === filename) {
        file.progress += chunk_size;
      }
      return file;
    }));
  }
  onMount(async () => {
    stream = await stream_handler(new URL(`${root}/gradio_api/upload_progress?upload_id=${upload_id}`));
    if (stream == null) {
      throw new Error("Event source is not defined");
    }
    stream.onmessage = async function(event) {
      const _data = JSON.parse(event.data);
      if (!progress)
        $$invalidate(1, progress = true);
      if (_data.msg === "done") {
        stream == null ? void 0 : stream.close();
        dispatch("done");
      } else {
        $$invalidate(7, current_file_upload = _data);
        handleProgress(_data.orig_name, _data.chunk_size);
      }
    };
  });
  onDestroy(() => {
    if (stream != null || stream != void 0)
      stream.close();
  });
  $$self.$$set = ($$props2) => {
    if ("upload_id" in $$props2)
      $$invalidate(3, upload_id = $$props2.upload_id);
    if ("root" in $$props2)
      $$invalidate(4, root = $$props2.root);
    if ("files" in $$props2)
      $$invalidate(5, files = $$props2.files);
    if ("stream_handler" in $$props2)
      $$invalidate(6, stream_handler = $$props2.stream_handler);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*files_with_progress*/
    1) {
      calculateTotalProgress(files_with_progress);
    }
    if ($$self.$$.dirty & /*current_file_upload, files_with_progress*/
    129) {
      $$invalidate(2, file_to_display = current_file_upload || files_with_progress[0]);
    }
  };
  return [
    files_with_progress,
    progress,
    file_to_display,
    upload_id,
    root,
    files,
    stream_handler,
    current_file_upload
  ];
}
class UploadProgress extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      upload_id: 3,
      root: 4,
      files: 5,
      stream_handler: 6
    });
  }
}
function create_drag() {
  let hidden_input;
  let _options;
  return {
    drag(node, options = {}) {
      _options = options;
      function setup_hidden_input() {
        hidden_input = document.createElement("input");
        hidden_input.type = "file";
        hidden_input.style.display = "none";
        hidden_input.setAttribute("aria-label", "File upload");
        hidden_input.setAttribute("data-testid", "file-upload");
        const accept_options = Array.isArray(_options.accepted_types) ? _options.accepted_types.join(",") : _options.accepted_types || void 0;
        if (accept_options) {
          hidden_input.accept = accept_options;
        }
        hidden_input.multiple = _options.mode === "multiple" || false;
        if (_options.mode === "directory") {
          hidden_input.webkitdirectory = true;
          hidden_input.setAttribute("directory", "");
          hidden_input.setAttribute("mozdirectory", "");
        }
        node.appendChild(hidden_input);
      }
      setup_hidden_input();
      function handle_drag(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      function handle_drag_enter(e) {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        (_a = _options.on_drag_change) == null ? void 0 : _a.call(_options, true);
      }
      function handle_drag_leave(e) {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        (_a = _options.on_drag_change) == null ? void 0 : _a.call(_options, false);
      }
      function handle_drop(e) {
        var _a, _b, _c;
        e.preventDefault();
        e.stopPropagation();
        (_a = _options.on_drag_change) == null ? void 0 : _a.call(_options, false);
        if (!((_b = e.dataTransfer) == null ? void 0 : _b.files))
          return;
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          (_c = _options.on_files) == null ? void 0 : _c.call(_options, files);
        }
      }
      function handle_click() {
        if (!_options.disable_click) {
          hidden_input.value = "";
          hidden_input.click();
        }
      }
      function handle_file_input_change() {
        var _a;
        if (hidden_input.files) {
          const files = Array.from(hidden_input.files);
          if (files.length > 0) {
            (_a = _options.on_files) == null ? void 0 : _a.call(_options, files);
          }
        }
      }
      node.addEventListener("drag", handle_drag);
      node.addEventListener("dragstart", handle_drag);
      node.addEventListener("dragend", handle_drag);
      node.addEventListener("dragover", handle_drag);
      node.addEventListener("dragenter", handle_drag_enter);
      node.addEventListener("dragleave", handle_drag_leave);
      node.addEventListener("drop", handle_drop);
      node.addEventListener("click", handle_click);
      hidden_input.addEventListener("change", handle_file_input_change);
      return {
        update(new_options) {
          _options = new_options;
          hidden_input.remove();
          setup_hidden_input();
          hidden_input.addEventListener("change", handle_file_input_change);
        },
        destroy() {
          node.removeEventListener("drag", handle_drag);
          node.removeEventListener("dragstart", handle_drag);
          node.removeEventListener("dragend", handle_drag);
          node.removeEventListener("dragover", handle_drag);
          node.removeEventListener("dragenter", handle_drag_enter);
          node.removeEventListener("dragleave", handle_drag_leave);
          node.removeEventListener("drop", handle_drop);
          node.removeEventListener("click", handle_click);
          hidden_input.removeEventListener("change", handle_file_input_change);
          hidden_input.remove();
        }
      };
    },
    open_file_upload() {
      if (hidden_input) {
        hidden_input.value = "";
        hidden_input.click();
      }
    }
  };
}
function create_else_block(ctx) {
  let button;
  let button_tabindex_value;
  let button_aria_label_value;
  let drag_action;
  let current;
  let mounted;
  let dispose;
  const default_slot_template = (
    /*#slots*/
    ctx[30].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[29],
    null
  );
  return {
    c() {
      button = element("button");
      if (default_slot)
        default_slot.c();
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", {
        tabindex: true,
        "aria-label": true,
        "aria-dropeffect": true,
        class: true
      });
      var button_nodes = children(button);
      if (default_slot)
        default_slot.l(button_nodes);
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button, "tabindex", button_tabindex_value = /*hidden*/
      ctx[9] ? -1 : 0);
      attr(button, "aria-label", button_aria_label_value = /*aria_label*/
      ctx[14] || "Click to upload or drop files");
      attr(button, "aria-dropeffect", "copy");
      attr(button, "class", "svelte-edrmkl");
      toggle_class(
        button,
        "hidden",
        /*hidden*/
        ctx[9]
      );
      toggle_class(
        button,
        "center",
        /*center*/
        ctx[4]
      );
      toggle_class(
        button,
        "boundedheight",
        /*boundedheight*/
        ctx[3]
      );
      toggle_class(
        button,
        "flex",
        /*flex*/
        ctx[5]
      );
      toggle_class(
        button,
        "disable_click",
        /*disable_click*/
        ctx[7]
      );
      toggle_class(
        button,
        "icon-mode",
        /*icon_upload*/
        ctx[12]
      );
      set_style(
        button,
        "height",
        /*icon_upload*/
        ctx[12] ? "" : (
          /*height*/
          ctx[13] ? typeof /*height*/
          ctx[13] === "number" ? (
            /*height*/
            ctx[13] + "px"
          ) : (
            /*height*/
            ctx[13]
          ) : "100%"
        )
      );
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      if (default_slot) {
        default_slot.m(button, null);
      }
      current = true;
      if (!mounted) {
        dispose = action_destroyer(drag_action = /*drag*/
        ctx[19].call(null, button, {
          on_drag_change: drag_function,
          on_files: (
            /*drag_function_1*/
            ctx[31]
          ),
          accepted_types: (
            /*accept_file_types*/
            ctx[18]
          ),
          mode: (
            /*file_count*/
            ctx[6]
          ),
          disable_click: (
            /*disable_click*/
            ctx[7]
          )
        }));
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty[0] & /*$$scope*/
        536870912)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[29],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[29]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[29],
              dirty,
              null
            ),
            null
          );
        }
      }
      if (!current || dirty[0] & /*hidden*/
      512 && button_tabindex_value !== (button_tabindex_value = /*hidden*/
      ctx2[9] ? -1 : 0)) {
        attr(button, "tabindex", button_tabindex_value);
      }
      if (!current || dirty[0] & /*aria_label*/
      16384 && button_aria_label_value !== (button_aria_label_value = /*aria_label*/
      ctx2[14] || "Click to upload or drop files")) {
        attr(button, "aria-label", button_aria_label_value);
      }
      if (drag_action && is_function(drag_action.update) && dirty[0] & /*accept_file_types, file_count, disable_click*/
      262336)
        drag_action.update.call(null, {
          on_drag_change: drag_function,
          on_files: (
            /*drag_function_1*/
            ctx2[31]
          ),
          accepted_types: (
            /*accept_file_types*/
            ctx2[18]
          ),
          mode: (
            /*file_count*/
            ctx2[6]
          ),
          disable_click: (
            /*disable_click*/
            ctx2[7]
          )
        });
      if (!current || dirty[0] & /*hidden*/
      512) {
        toggle_class(
          button,
          "hidden",
          /*hidden*/
          ctx2[9]
        );
      }
      if (!current || dirty[0] & /*center*/
      16) {
        toggle_class(
          button,
          "center",
          /*center*/
          ctx2[4]
        );
      }
      if (!current || dirty[0] & /*boundedheight*/
      8) {
        toggle_class(
          button,
          "boundedheight",
          /*boundedheight*/
          ctx2[3]
        );
      }
      if (!current || dirty[0] & /*flex*/
      32) {
        toggle_class(
          button,
          "flex",
          /*flex*/
          ctx2[5]
        );
      }
      if (!current || dirty[0] & /*disable_click*/
      128) {
        toggle_class(
          button,
          "disable_click",
          /*disable_click*/
          ctx2[7]
        );
      }
      if (!current || dirty[0] & /*icon_upload*/
      4096) {
        toggle_class(
          button,
          "icon-mode",
          /*icon_upload*/
          ctx2[12]
        );
      }
      if (dirty[0] & /*icon_upload, height*/
      12288) {
        set_style(
          button,
          "height",
          /*icon_upload*/
          ctx2[12] ? "" : (
            /*height*/
            ctx2[13] ? typeof /*height*/
            ctx2[13] === "number" ? (
              /*height*/
              ctx2[13] + "px"
            ) : (
              /*height*/
              ctx2[13]
            ) : "100%"
          )
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
        detach(button);
      }
      if (default_slot)
        default_slot.d(detaching);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_1(ctx) {
  let if_block_anchor;
  let current;
  let if_block = !/*hidden*/
  ctx[9] && create_if_block_2(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      if (if_block)
        if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (!/*hidden*/
      ctx2[9]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*hidden*/
          512) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_2(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
        detach(if_block_anchor);
      }
      if (if_block)
        if_block.d(detaching);
    }
  };
}
function create_if_block(ctx) {
  let button;
  let button_tabindex_value;
  let button_aria_label_value;
  let current;
  let mounted;
  let dispose;
  const default_slot_template = (
    /*#slots*/
    ctx[30].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[29],
    null
  );
  return {
    c() {
      button = element("button");
      if (default_slot)
        default_slot.c();
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", {
        tabindex: true,
        "aria-label": true,
        class: true
      });
      var button_nodes = children(button);
      if (default_slot)
        default_slot.l(button_nodes);
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button, "tabindex", button_tabindex_value = /*hidden*/
      ctx[9] ? -1 : 0);
      attr(button, "aria-label", button_aria_label_value = /*aria_label*/
      ctx[14] || "Paste from clipboard");
      attr(button, "class", "svelte-edrmkl");
      toggle_class(
        button,
        "hidden",
        /*hidden*/
        ctx[9]
      );
      toggle_class(
        button,
        "center",
        /*center*/
        ctx[4]
      );
      toggle_class(
        button,
        "boundedheight",
        /*boundedheight*/
        ctx[3]
      );
      toggle_class(
        button,
        "flex",
        /*flex*/
        ctx[5]
      );
      toggle_class(
        button,
        "icon-mode",
        /*icon_upload*/
        ctx[12]
      );
      set_style(
        button,
        "height",
        /*icon_upload*/
        ctx[12] ? "" : (
          /*height*/
          ctx[13] ? typeof /*height*/
          ctx[13] === "number" ? (
            /*height*/
            ctx[13] + "px"
          ) : (
            /*height*/
            ctx[13]
          ) : "100%"
        )
      );
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      if (default_slot) {
        default_slot.m(button, null);
      }
      current = true;
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*paste_clipboard*/
          ctx[15]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty[0] & /*$$scope*/
        536870912)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[29],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[29]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[29],
              dirty,
              null
            ),
            null
          );
        }
      }
      if (!current || dirty[0] & /*hidden*/
      512 && button_tabindex_value !== (button_tabindex_value = /*hidden*/
      ctx2[9] ? -1 : 0)) {
        attr(button, "tabindex", button_tabindex_value);
      }
      if (!current || dirty[0] & /*aria_label*/
      16384 && button_aria_label_value !== (button_aria_label_value = /*aria_label*/
      ctx2[14] || "Paste from clipboard")) {
        attr(button, "aria-label", button_aria_label_value);
      }
      if (!current || dirty[0] & /*hidden*/
      512) {
        toggle_class(
          button,
          "hidden",
          /*hidden*/
          ctx2[9]
        );
      }
      if (!current || dirty[0] & /*center*/
      16) {
        toggle_class(
          button,
          "center",
          /*center*/
          ctx2[4]
        );
      }
      if (!current || dirty[0] & /*boundedheight*/
      8) {
        toggle_class(
          button,
          "boundedheight",
          /*boundedheight*/
          ctx2[3]
        );
      }
      if (!current || dirty[0] & /*flex*/
      32) {
        toggle_class(
          button,
          "flex",
          /*flex*/
          ctx2[5]
        );
      }
      if (!current || dirty[0] & /*icon_upload*/
      4096) {
        toggle_class(
          button,
          "icon-mode",
          /*icon_upload*/
          ctx2[12]
        );
      }
      if (dirty[0] & /*icon_upload, height*/
      12288) {
        set_style(
          button,
          "height",
          /*icon_upload*/
          ctx2[12] ? "" : (
            /*height*/
            ctx2[13] ? typeof /*height*/
            ctx2[13] === "number" ? (
              /*height*/
              ctx2[13] + "px"
            ) : (
              /*height*/
              ctx2[13]
            ) : "100%"
          )
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
        detach(button);
      }
      if (default_slot)
        default_slot.d(detaching);
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2(ctx) {
  let uploadprogress;
  let current;
  uploadprogress = new UploadProgress({
    props: {
      root: (
        /*root*/
        ctx[8]
      ),
      upload_id: (
        /*upload_id*/
        ctx[16]
      ),
      files: (
        /*file_data*/
        ctx[17]
      ),
      stream_handler: (
        /*stream_handler*/
        ctx[11]
      )
    }
  });
  return {
    c() {
      create_component(uploadprogress.$$.fragment);
    },
    l(nodes) {
      claim_component(uploadprogress.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(uploadprogress, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const uploadprogress_changes = {};
      if (dirty[0] & /*root*/
      256)
        uploadprogress_changes.root = /*root*/
        ctx2[8];
      if (dirty[0] & /*upload_id*/
      65536)
        uploadprogress_changes.upload_id = /*upload_id*/
        ctx2[16];
      if (dirty[0] & /*file_data*/
      131072)
        uploadprogress_changes.files = /*file_data*/
        ctx2[17];
      if (dirty[0] & /*stream_handler*/
      2048)
        uploadprogress_changes.stream_handler = /*stream_handler*/
        ctx2[11];
      uploadprogress.$set(uploadprogress_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(uploadprogress.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(uploadprogress.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(uploadprogress, detaching);
    }
  };
}
function create_fragment(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*filetype*/
      ctx2[0] === "clipboard"
    )
      return 0;
    if (
      /*uploading*/
      ctx2[2] && /*show_progress*/
      ctx2[10]
    )
      return 1;
    return 2;
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
function is_valid_mimetype(file_accept, uploaded_file_extension, uploaded_file_type) {
  if (!file_accept || file_accept === "*" || file_accept === "file/*" || Array.isArray(file_accept) && file_accept.some((accept) => accept === "*" || accept === "file/*")) {
    return true;
  }
  let acceptArray;
  if (typeof file_accept === "string") {
    acceptArray = file_accept.split(",").map((s) => s.trim());
  } else if (Array.isArray(file_accept)) {
    acceptArray = file_accept;
  } else {
    return false;
  }
  return acceptArray.includes(uploaded_file_extension) || acceptArray.some((type) => {
    const [category] = type.split("/").map((s) => s.trim());
    return type.endsWith("/*") && uploaded_file_type.startsWith(category + "/");
  });
}
const drag_function = (dragging) => dragging = dragging;
function instance($$self, $$props, $$invalidate) {
  let ios;
  let { $$slots: slots = {}, $$scope } = $$props;
  const { drag, open_file_upload: _open_file_upload } = create_drag();
  let { filetype = null } = $$props;
  let { dragging = false } = $$props;
  let { boundedheight = true } = $$props;
  let { center = true } = $$props;
  let { flex = true } = $$props;
  let { file_count = "single" } = $$props;
  let { disable_click = false } = $$props;
  let { root } = $$props;
  let { hidden = false } = $$props;
  let { format = "file" } = $$props;
  let { uploading = false } = $$props;
  let { show_progress = true } = $$props;
  let { max_file_size = null } = $$props;
  let { upload } = $$props;
  let { stream_handler } = $$props;
  let { icon_upload = false } = $$props;
  let { height = void 0 } = $$props;
  let { aria_label = void 0 } = $$props;
  function open_upload() {
    _open_file_upload();
  }
  let upload_id;
  let file_data;
  let accept_file_types;
  let use_post_upload_validation = null;
  const get_ios = () => {
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent.toLowerCase();
      return userAgent.indexOf("iphone") > -1 || userAgent.indexOf("ipad") > -1;
    }
    return false;
  };
  const dispatch = createEventDispatcher();
  const validFileTypes = ["image", "video", "audio", "text", "file"];
  const process_file_type = (type) => {
    if (ios && type.startsWith(".")) {
      use_post_upload_validation = true;
      return type;
    }
    if (ios && type.includes("file/*")) {
      return "*";
    }
    if (type.startsWith(".") || type.endsWith("/*")) {
      return type;
    }
    if (validFileTypes.includes(type)) {
      return type + "/*";
    }
    return "." + type;
  };
  function paste_clipboard() {
    navigator.clipboard.read().then(async (items) => {
      for (let i = 0; i < items.length; i++) {
        const type = items[i].types.find((t) => t.startsWith("image/"));
        if (type) {
          items[i].getType(type).then(async (blob) => {
            const file = new File([blob], `clipboard.${type.replace("image/", "")}`);
            await load_files([file]);
          });
          break;
        }
      }
    });
  }
  function open_file_upload() {
    _open_file_upload();
  }
  async function handle_upload(file_data2) {
    await tick();
    $$invalidate(16, upload_id = Math.random().toString(36).substring(2, 15));
    $$invalidate(2, uploading = true);
    try {
      const _file_data = await upload(file_data2, root, upload_id, max_file_size ?? Infinity);
      dispatch("load", file_count === "single" ? _file_data == null ? void 0 : _file_data[0] : _file_data);
      $$invalidate(2, uploading = false);
      return _file_data || [];
    } catch (e) {
      dispatch("error", e.message);
      $$invalidate(2, uploading = false);
      return [];
    }
  }
  async function load_files(files) {
    if (!files.length) {
      return;
    }
    let _files = files.map((f) => new File([f], f instanceof File ? f.name : "file", { type: f.type }));
    if (ios && use_post_upload_validation) {
      _files = _files.filter((file) => {
        if (is_valid_file(file)) {
          return true;
        }
        dispatch("error", `Invalid file type: ${file.name}. Only ${filetype} allowed.`);
        return false;
      });
      if (_files.length === 0) {
        return [];
      }
    }
    $$invalidate(17, file_data = await prepare_files(_files));
    return await handle_upload(file_data);
  }
  function is_valid_file(file) {
    if (!filetype)
      return true;
    const allowed_types = Array.isArray(filetype) ? filetype : [filetype];
    return allowed_types.some((type) => {
      const processed_type = process_file_type(type);
      if (processed_type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(processed_type.toLowerCase());
      }
      if (processed_type === "*") {
        return true;
      }
      if (processed_type.endsWith("/*")) {
        const [category] = processed_type.split("/");
        return file.type.startsWith(category + "/");
      }
      return file.type === processed_type;
    });
  }
  async function load_files_from_upload(files) {
    const files_to_load = files.filter((file) => {
      const file_extension = "." + file.name.split(".").pop();
      if (file_extension && is_valid_mimetype(accept_file_types, file_extension, file.type)) {
        return true;
      }
      if (file_extension && Array.isArray(filetype) ? filetype.includes(file_extension) : file_extension === filetype) {
        return true;
      }
      dispatch("error", `Invalid file type only ${filetype} allowed.`);
      return false;
    });
    if (format != "blob") {
      await load_files(files_to_load);
    } else {
      if (file_count === "single") {
        dispatch("load", files_to_load[0]);
        return;
      }
      dispatch("load", files_to_load);
    }
  }
  async function load_files_from_drop(e) {
    var _a;
    $$invalidate(1, dragging = false);
    if (!((_a = e.dataTransfer) == null ? void 0 : _a.files))
      return;
    const files_to_load = Array.from(e.dataTransfer.files).filter(is_valid_file);
    if (format != "blob") {
      await load_files(files_to_load);
    } else {
      if (file_count === "single") {
        dispatch("load", files_to_load[0]);
        return;
      }
      dispatch("load", files_to_load);
    }
  }
  const drag_function_1 = (files) => load_files_from_upload(files);
  $$self.$$set = ($$props2) => {
    if ("filetype" in $$props2)
      $$invalidate(0, filetype = $$props2.filetype);
    if ("dragging" in $$props2)
      $$invalidate(1, dragging = $$props2.dragging);
    if ("boundedheight" in $$props2)
      $$invalidate(3, boundedheight = $$props2.boundedheight);
    if ("center" in $$props2)
      $$invalidate(4, center = $$props2.center);
    if ("flex" in $$props2)
      $$invalidate(5, flex = $$props2.flex);
    if ("file_count" in $$props2)
      $$invalidate(6, file_count = $$props2.file_count);
    if ("disable_click" in $$props2)
      $$invalidate(7, disable_click = $$props2.disable_click);
    if ("root" in $$props2)
      $$invalidate(8, root = $$props2.root);
    if ("hidden" in $$props2)
      $$invalidate(9, hidden = $$props2.hidden);
    if ("format" in $$props2)
      $$invalidate(21, format = $$props2.format);
    if ("uploading" in $$props2)
      $$invalidate(2, uploading = $$props2.uploading);
    if ("show_progress" in $$props2)
      $$invalidate(10, show_progress = $$props2.show_progress);
    if ("max_file_size" in $$props2)
      $$invalidate(22, max_file_size = $$props2.max_file_size);
    if ("upload" in $$props2)
      $$invalidate(23, upload = $$props2.upload);
    if ("stream_handler" in $$props2)
      $$invalidate(11, stream_handler = $$props2.stream_handler);
    if ("icon_upload" in $$props2)
      $$invalidate(12, icon_upload = $$props2.icon_upload);
    if ("height" in $$props2)
      $$invalidate(13, height = $$props2.height);
    if ("aria_label" in $$props2)
      $$invalidate(14, aria_label = $$props2.aria_label);
    if ("$$scope" in $$props2)
      $$invalidate(29, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*filetype, ios*/
    268435457) {
      if (filetype == null) {
        $$invalidate(18, accept_file_types = null);
      } else if (typeof filetype === "string") {
        $$invalidate(18, accept_file_types = process_file_type(filetype));
      } else if (ios && filetype.includes("file/*")) {
        $$invalidate(18, accept_file_types = "*");
      } else {
        $$invalidate(0, filetype = filetype.map(process_file_type));
        $$invalidate(18, accept_file_types = filetype.join(", "));
      }
    }
  };
  $$invalidate(28, ios = get_ios());
  return [
    filetype,
    dragging,
    uploading,
    boundedheight,
    center,
    flex,
    file_count,
    disable_click,
    root,
    hidden,
    show_progress,
    stream_handler,
    icon_upload,
    height,
    aria_label,
    paste_clipboard,
    upload_id,
    file_data,
    accept_file_types,
    drag,
    load_files_from_upload,
    format,
    max_file_size,
    upload,
    open_upload,
    open_file_upload,
    load_files,
    load_files_from_drop,
    ios,
    $$scope,
    slots,
    drag_function_1
  ];
}
class Upload2 extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance,
      create_fragment,
      safe_not_equal,
      {
        filetype: 0,
        dragging: 1,
        boundedheight: 3,
        center: 4,
        flex: 5,
        file_count: 6,
        disable_click: 7,
        root: 8,
        hidden: 9,
        format: 21,
        uploading: 2,
        show_progress: 10,
        max_file_size: 22,
        upload: 23,
        stream_handler: 11,
        icon_upload: 12,
        height: 13,
        aria_label: 14,
        open_upload: 24,
        paste_clipboard: 15,
        open_file_upload: 25,
        load_files: 26,
        load_files_from_drop: 27
      },
      null,
      [-1, -1]
    );
  }
  get open_upload() {
    return this.$$.ctx[24];
  }
  get paste_clipboard() {
    return this.$$.ctx[15];
  }
  get open_file_upload() {
    return this.$$.ctx[25];
  }
  get load_files() {
    return this.$$.ctx[26];
  }
  get load_files_from_drop() {
    return this.$$.ctx[27];
  }
}
export {
  ImagePaste as I,
  Upload$1 as U,
  Upload2 as a,
  create_drag as c
};
