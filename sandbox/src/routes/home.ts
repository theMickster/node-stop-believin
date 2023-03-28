import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send("What's up doc ?!");
});

export default router 