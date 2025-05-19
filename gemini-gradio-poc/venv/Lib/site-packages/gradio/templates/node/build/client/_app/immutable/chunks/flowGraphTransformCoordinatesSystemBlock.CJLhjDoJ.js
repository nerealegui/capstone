import { F as FlowGraphBlock } from "./KHR_interactivity.BEJuWS3u.js";
import { R as RichTypeAny, e as RichTypeVector3 } from "./declarationMapper.uCBvEQca.js";
import { a as TmpVectors, V as Vector3, R as RegisterClass } from "./index.B4f7kVg_.js";
class FlowGraphTransformCoordinatesSystemBlock extends FlowGraphBlock {
  /**
   * Creates a new FlowGraphCoordinateTransformBlock
   * @param config optional configuration for this block
   */
  constructor(config) {
    super(config);
    this.sourceSystem = this.registerDataInput("sourceSystem", RichTypeAny);
    this.destinationSystem = this.registerDataInput("destinationSystem", RichTypeAny);
    this.inputCoordinates = this.registerDataInput("inputCoordinates", RichTypeVector3);
    this.outputCoordinates = this.registerDataOutput("outputCoordinates", RichTypeVector3);
  }
  _updateOutputs(_context) {
    const sourceSystemValue = this.sourceSystem.getValue(_context);
    const destinationSystemValue = this.destinationSystem.getValue(_context);
    const inputCoordinatesValue = this.inputCoordinates.getValue(_context);
    const sourceWorld = sourceSystemValue.getWorldMatrix();
    const destinationWorld = destinationSystemValue.getWorldMatrix();
    const destinationWorldInverse = TmpVectors.Matrix[0].copyFrom(destinationWorld);
    destinationWorldInverse.invert();
    const sourceToDestination = TmpVectors.Matrix[1];
    destinationWorldInverse.multiplyToRef(sourceWorld, sourceToDestination);
    const outputCoordinatesValue = this.outputCoordinates.getValue(_context);
    Vector3.TransformCoordinatesToRef(inputCoordinatesValue, sourceToDestination, outputCoordinatesValue);
  }
  /**
   * Gets the class name of this block
   * @returns the class name
   */
  getClassName() {
    return "FlowGraphTransformCoordinatesSystemBlock";
  }
}
RegisterClass("FlowGraphTransformCoordinatesSystemBlock", FlowGraphTransformCoordinatesSystemBlock);
export {
  FlowGraphTransformCoordinatesSystemBlock
};
