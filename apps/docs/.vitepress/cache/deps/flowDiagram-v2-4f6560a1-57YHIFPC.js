import {
  flowRendererV2,
  flowStyles
} from "./chunk-WI6Y6IMF.js";
import {
  flowDb,
  parser$1
} from "./chunk-K4FFILIM.js";
import "./chunk-RNMNO7ND.js";
import "./chunk-IGKSCXZD.js";
import "./chunk-7SMZC4XZ.js";
import "./chunk-3ITVIAZC.js";
import "./chunk-THGUNX3D.js";
import {
  require_dist,
  setConfig
} from "./chunk-PBFB7VAM.js";
import {
  require_dayjs_min
} from "./chunk-W6WSRH2Q.js";
import "./chunk-SWUFED32.js";
import {
  __toESM
} from "./chunk-PR4QN5HX.js";

// ../../node_modules/.pnpm/mermaid@10.9.5/node_modules/mermaid/dist/flowDiagram-v2-4f6560a1.js
var import_dayjs = __toESM(require_dayjs_min(), 1);
var import_sanitize_url = __toESM(require_dist(), 1);
var diagram = {
  parser: parser$1,
  db: flowDb,
  renderer: flowRendererV2,
  styles: flowStyles,
  init: (cnf) => {
    if (!cnf.flowchart) {
      cnf.flowchart = {};
    }
    cnf.flowchart.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    setConfig({ flowchart: { arrowMarkerAbsolute: cnf.arrowMarkerAbsolute } });
    flowRendererV2.setConf(cnf.flowchart);
    flowDb.clear();
    flowDb.setGen("gen-2");
  }
};
export {
  diagram
};
//# sourceMappingURL=flowDiagram-v2-4f6560a1-57YHIFPC.js.map
