const resultadoRepository = require('../repositories/resultado.repository');

const auditoriaService = {
  async registrar(TipoAccion, Modulo, Descripcion, UsuarioAccion, extra = {}) {
    try {
      await resultadoRepository.registrarAuditoria(
        extra.PartidoID || null,
        extra.GolesLocal || null,
        extra.GolesVisitante || null,
        UsuarioAccion || 'sistema',
        TipoAccion,
        Modulo,
        Descripcion
      );
    } catch (error) {
      console.error('❌ Error registrando auditoría:', error);
    }
  }
};

module.exports = auditoriaService;