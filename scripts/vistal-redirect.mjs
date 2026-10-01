export default {
  fetch(request) {
    const current = new URL(request.url);
    const destination = new URL(current.pathname + current.search, "https://vistall.nlsites01.workers.dev");
    return Response.redirect(destination, 308);
  },
};
