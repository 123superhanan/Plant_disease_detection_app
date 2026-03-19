// inference/inference.js (example)
import * as tf from '@tensorflow/tfjs-node'; // or tfjs-node-gpu

let model;
(async () => {
  model = await tf.loadLayersModel('file://./models/plant_model/model.json');
})();

export async function runRealInference(buffer) {
  const tensor = tf.node
    .decodeImage(buffer)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255.0)
    .expandDims(0);

  const pred = model.predict(tensor);
  const data = await pred.data();
  tensor.dispose();
  pred.dispose();

  const maxIdx = data.indexOf(Math.max(...data));
  return {
    label: classNames[maxIdx],
    confidence: data[maxIdx],
    risk_score: 1 - data[maxIdx], // example
  };
}
