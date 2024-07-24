<template>
  <div class="Analyze">
    <div class="Title">
      <p>OCR识别</p>

      <button>退出</button>
    </div>

    <div class="Main">
      <router-view />
    </div>
  </div>
</template>

<style>
.Main {
  padding-top: 0.5rem;

  /* height: calc(100% - 50px - 1rem); */

  border-top: 2px solid #c798a0;
}

.Title {
  top: 0;
  padding-bottom: 0.5rem;

  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;

  border-bottom: 2px solid #c798a0;
}

.Title p {
  color: #000;
  font-size: 1.5rem;
  font-weight: 600;
}

.Title button {
  color: #000;
  padding: 0.25rem 1.5rem;
}

button {
  border-radius: 8px;
  background-color: #fae6c8 !important;
  border: 2px solid #9cc4b6;
}

.Analyze {
  position: absolute;
  padding: 1.5rem 0.5rem;

  top: 0;
  left: 50%;

  width: 375px;
  min-height: 100vh;

  border-radius: 4px;
  background-color: #dbe9fc;

  overflow: hidden;
  box-sizing: border-box;
  transform: translate(-50%, 0);
}
</style>
