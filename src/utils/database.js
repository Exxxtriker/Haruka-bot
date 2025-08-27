const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conectado ao MongoDB!');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error);
    }
}

module.exports = connectDB;
