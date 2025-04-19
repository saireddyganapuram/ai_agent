import * as aiService from '../services/aiService.js'

export const getResult = async (req,res) => {
    try {
        const {prompt} = req.query;
        const result = await aiService.generateResult(prompt);
        res.send(result)
    } catch(error) {
        console.log(error)
    };
    
};