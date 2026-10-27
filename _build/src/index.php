<?php
/* CalcoloRAL — router minimale per lo stack Nginx (Lightning) di Cloudways.
   Nginx serve direttamente i file statici; questo file entra in gioco solo per "/"
   (dove index.php ha precedenza su index.html) e come fallback per gli URL inesistenti. */
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rawurldecode($uri);
$root = __DIR__;

/* Sorgenti e file di servizio: mai esposti */
if (preg_match('#^/(_build|\.git|\.github)(/|$)#', $uri) || preg_match('#^/(README\.md|package(-lock)?\.json)$#', $uri)) {
  http_response_code(404);
  readfile($root . '/404.html');
  exit;
}

/* Directory senza slash finale → 301 con slash */
if ($uri !== '/' && substr($uri, -1) !== '/' && is_dir($root . $uri) && is_file($root . $uri . '/index.html')) {
  header('Location: ' . $uri . '/' . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : ''), true, 301);
  exit;
}

$file = $root . ($uri === '/' ? '/index.html' : rtrim($uri, '/') . '/index.html');
if (is_file($file) && strpos(realpath($file), realpath($root)) === 0) {
  header('Content-Type: text/html; charset=utf-8');
  header('Cache-Control: public, max-age=3600');
  readfile($file);
  exit;
}

http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
readfile($root . '/404.html');
