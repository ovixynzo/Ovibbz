<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Bot Dashboard — Dark Premium Glass</title>
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <main class="container">
    <header class="topbar">
      <h1>Bot Dashboard</h1>
      <div id="status" class="status off">OFFLINE</div>
    </header>

    <section class="card glass">
      <h2>Bot Info</h2>
      <label>Bot Name</label>
      <input id="name" placeholder="e.g. MyMiraiBot" />

      <label>Prefix</label>
      <input id="prefix" placeholder="e.g. !" />

      <label>Admin UID</label>
      <input id="admin" placeholder="1234567890" />

      <label>AppState / Cookie JSON</label>
      <textarea id="appstate" rows="8" placeholder='Paste JSON here'></textarea>

      <div class="controls">
        <button id="activate" class="btn primary">ACTIVATE BOT</button>
        <button id="stop" class="btn">STOP BOT</button>
      </div>

      <div id="toast" class="toast"></div>
    </section>

    <footer class="footer">Dark Premium Glass · Auto Start</footer>
  </main>

  <script src="/js/control.js"></script>
</body>
</html>
