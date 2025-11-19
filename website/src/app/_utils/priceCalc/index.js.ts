import { FileToTranscribe } from "@/app/_components/FileToTranscribeType";

export function getPriceForDuration(seconds: number) {
  // 2.99 euro per hour
  const costInEuroPerSecond = 2.99 / 3600;
  return seconds * costInEuroPerSecond;
}

export function getTotalPriceForCart(files: FileToTranscribe[]) {
  // return the accumulated price for all files in the cart
  // the minimum price is 0.50 euro, this just covers paypal's fixed fee of 0.30 euro per transaction
  const minimumPrice = 0.5;
  const totalSeconds = files.reduce(
    (acc, file) => acc + file.playbackSeconds,
    0,
  );
  const totalPrice = getPriceForDuration(totalSeconds);

  return Math.max(totalPrice, minimumPrice);
}
