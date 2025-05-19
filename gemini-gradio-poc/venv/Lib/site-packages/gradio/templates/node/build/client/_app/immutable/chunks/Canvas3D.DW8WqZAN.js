const __vite__fileDeps=["./index.B4f7kVg_.js","./preload-helper.DpQnamwV.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import { _ as __vitePreload } from "./preload-helper.DpQnamwV.js";
import { SvelteComponent, init, safe_not_equal, element, claim_element, children, detach, insert_hydration, noop, onMount, binding_callbacks } from "../../../svelte/svelte.js";
import "../../../svelte/svelte-submodules.js";
import { r as resolve_wasm_src } from "./2.D3x_Usqw.js";
function create_fragment(ctx) {
  let canvas_1;
  return {
    c() {
      canvas_1 = element("canvas");
    },
    l(nodes) {
      canvas_1 = claim_element(nodes, "CANVAS", {});
      children(canvas_1).forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, canvas_1, anchor);
      ctx[12](canvas_1);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(canvas_1);
      }
      ctx[12](null);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let url;
  let BABYLON_VIEWER;
  let { value } = $$props;
  let { display_mode } = $$props;
  let { clear_color } = $$props;
  let { camera_position } = $$props;
  let { zoom_speed } = $$props;
  let { pan_speed } = $$props;
  let { resolved_url = void 0 } = $$props;
  let latest_url;
  let canvas;
  let viewer;
  let viewerDetails;
  let mounted = false;
  onMount(() => {
    const initViewer = async () => {
      BABYLON_VIEWER = await __vitePreload(() => import("./index.B4f7kVg_.js").then((n) => n.bY), true ? __vite__mapDeps([0,1]) : void 0, import.meta.url);
      BABYLON_VIEWER.createViewerForCanvas(canvas, {
        clearColor: clear_color,
        useRightHandedSystem: true,
        animationAutoPlay: true,
        cameraAutoOrbit: { enabled: false },
        onInitialized: (details) => {
          viewerDetails = details;
        }
      }).then((promiseViewer) => {
        viewer = promiseViewer;
        $$invalidate(10, mounted = true);
      });
    };
    initViewer();
    return () => {
      viewer == null ? void 0 : viewer.dispose();
    };
  });
  function setRenderingMode(pointsCloud, wireframe) {
    viewerDetails.scene.forcePointsCloud = pointsCloud;
    viewerDetails.scene.forceWireframe = wireframe;
  }
  function load_model(url2) {
    if (viewer) {
      if (url2) {
        viewer.loadModel(url2, {
          pluginOptions: { obj: { importVertexColors: true } }
        }).then(() => {
          if (display_mode === "point_cloud") {
            setRenderingMode(true, false);
          } else if (display_mode === "wireframe") {
            setRenderingMode(false, true);
          } else {
            update_camera(camera_position, zoom_speed, pan_speed);
          }
        });
      } else {
        viewer.resetModel();
      }
    }
  }
  function update_camera(camera_position2, zoom_speed2, pan_speed2) {
    viewer.resetCamera();
    const camera = viewerDetails.camera;
    if (camera_position2[0] !== null) {
      camera.alpha = camera_position2[0] * Math.PI / 180;
    }
    if (camera_position2[1] !== null) {
      camera.beta = camera_position2[1] * Math.PI / 180;
    }
    if (camera_position2[2] !== null) {
      camera.radius = camera_position2[2];
    }
    camera.lowerRadiusLimit = 0.1;
    const updateCameraSensibility = () => {
      camera.wheelPrecision = 250 / (camera.radius * zoom_speed2);
      camera.panningSensibility = 1e4 * pan_speed2 / camera.radius;
    };
    updateCameraSensibility();
    camera.onAfterCheckInputsObservable.add(updateCameraSensibility);
  }
  function reset_camera_position(camera_position2, zoom_speed2, pan_speed2) {
    if (viewerDetails) {
      update_camera(camera_position2, zoom_speed2, pan_speed2);
    }
  }
  function canvas_1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      canvas = $$value;
      $$invalidate(0, canvas);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("value" in $$props2)
      $$invalidate(2, value = $$props2.value);
    if ("display_mode" in $$props2)
      $$invalidate(3, display_mode = $$props2.display_mode);
    if ("clear_color" in $$props2)
      $$invalidate(4, clear_color = $$props2.clear_color);
    if ("camera_position" in $$props2)
      $$invalidate(5, camera_position = $$props2.camera_position);
    if ("zoom_speed" in $$props2)
      $$invalidate(6, zoom_speed = $$props2.zoom_speed);
    if ("pan_speed" in $$props2)
      $$invalidate(7, pan_speed = $$props2.pan_speed);
    if ("resolved_url" in $$props2)
      $$invalidate(1, resolved_url = $$props2.resolved_url);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*value*/
    4) {
      $$invalidate(11, url = value.url);
    }
    if ($$self.$$.dirty & /*url, latest_url*/
    2560) {
      {
        $$invalidate(1, resolved_url = url);
        if (url) {
          $$invalidate(9, latest_url = url);
          const resolving_url = url;
          resolve_wasm_src(url).then((resolved) => {
            if (latest_url === resolving_url) {
              $$invalidate(1, resolved_url = resolved ?? void 0);
            } else {
              resolved && URL.revokeObjectURL(resolved);
            }
          });
        }
      }
    }
    if ($$self.$$.dirty & /*mounted, resolved_url*/
    1026) {
      mounted && load_model(resolved_url);
    }
  };
  return [
    canvas,
    resolved_url,
    value,
    display_mode,
    clear_color,
    camera_position,
    zoom_speed,
    pan_speed,
    reset_camera_position,
    latest_url,
    mounted,
    url,
    canvas_1_binding
  ];
}
class Canvas3D extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      value: 2,
      display_mode: 3,
      clear_color: 4,
      camera_position: 5,
      zoom_speed: 6,
      pan_speed: 7,
      resolved_url: 1,
      reset_camera_position: 8
    });
  }
  get reset_camera_position() {
    return this.$$.ctx[8];
  }
}
export {
  Canvas3D as default
};
