<script>
  import { ToastNotification } from "carbon-components-svelte";
</script>

<div class="notify">
  <ToastNotification
    lowContrast=false
    kind="error"
    title="Error"
    subtitle="Restricted access."
    caption="Contact us."
    hideCloseButton
    timeout="2500"
  />
</div>

<style lang="css">
  .notify {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
  }
</style>
