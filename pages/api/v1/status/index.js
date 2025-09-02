function status(request, response) {
  response.status(200).json({
    status: "Ativo",
  });
}

export default status;
