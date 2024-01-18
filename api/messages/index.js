const DataModel = require("../../data.model");

const dataModel = new DataModel();
async function sendMessage(req, res) {
    try {
        const { body } = req;
        const data = await dataModel.addMessage(body);

        if (!data.success) {
            return res.status(401).json({ 
                success: false,
                message: 'Gagal menambah pesan!',
                data: data.data
             })
        }

        res.status(201).json({
            success: true,
            message: 'Berhasil menambah pesan!',
            data: data.data
        })
    } catch (error) {
        console.log(error);
         res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { sendMessage }