import "./style.css";

const playButton = document.getElementById("play") as HTMLButtonElement;

playButton.addEventListener("click", async () => {
  const entry = document.getElementById("entry") as HTMLDivElement;
  entry.style.display = "none";
  const loading = document.getElementById("p5_loading") as HTMLDivElement;
  loading.style.display = "flex";

  await import("./p5_entry.ts");

});
