//middleware/upload.js
//Upload de imagem dos produtos (multer) aceitando somente JPEG e PNG
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const PASTA_UPLOADS = path.join(__dirname, '..', 'uploads');
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

// mimetype permitido -> extensões permitidas
const TIPOS_PERMITIDOS = {
    'image/jpeg': ['.jpeg', '.jpg'], // .jpg é o mesmo formato JPEG
    'image/png': ['.png']
};
const MSG_TIPO_INVALIDO = 'A imagem deve estar no formato .jpeg ou .png!';

// "assinatura" (primeiros bytes) real de cada formato
const ASSINATURAS = {
    'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]),
    'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PASTA_UPLOADS),
    filename: (req, file, cb) => {
        // a extensão vem do tipo validado, nunca do nome enviado pelo cliente
        const ext = file.mimetype === 'image/png' ? '.png' : '.jpeg';
        cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const extensoes = TIPOS_PERMITIDOS[file.mimetype];

    if (!extensoes || !extensoes.includes(ext)) {
        return cb(new Error(MSG_TIPO_INVALIDO));
    }
    cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: TAMANHO_MAXIMO } });

// Confere se o conteúdo do arquivo realmente é do tipo informado
function assinaturaValida(caminho, mimetype) {
    const esperado = ASSINATURAS[mimetype];
    if (!esperado) return false;

    const fd = fs.openSync(caminho, 'r');
    try {
        const lido = Buffer.alloc(esperado.length);
        fs.readSync(fd, lido, 0, esperado.length, 0);
        return lido.equals(esperado);
    } finally {
        fs.closeSync(fd);
    }
}

function removerImagem(nomeArquivo) {
    if (!nomeArquivo) return;
    // path.basename evita sair da pasta de uploads
    fs.unlink(path.join(PASTA_UPLOADS, path.basename(nomeArquivo)), () => { });
}

// URL pública da imagem (ou null quando o produto não tem imagem)
function urlImagem(req, nomeArquivo) {
    if (!nomeArquivo) return null;
    return `${req.protocol}://${req.get('host')}/uploads/${nomeArquivo}`;
}

// Middleware usado nas rotas: campo do formulário = "imagem"
function uploadImagem(req, res, next) {
    upload.single('imagem')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'A imagem deve ter no máximo 5 MB!'
                : err instanceof multer.MulterError
                    ? 'Erro ao enviar a imagem: ' + err.message
                    : err.message;
            return res.status(422).json({ message });
        }

        if (req.file && !assinaturaValida(req.file.path, req.file.mimetype)) {
            removerImagem(req.file.filename);
            return res.status(422).json({ message: MSG_TIPO_INVALIDO });
        }
        next();
    });
}

module.exports = { uploadImagem, removerImagem, urlImagem, assinaturaValida };
