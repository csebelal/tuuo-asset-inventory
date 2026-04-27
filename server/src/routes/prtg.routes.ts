import { Router, Request, Response } from 'express';
import axios from 'axios';
import https from 'https';

const router = Router();

const PRTG_BASE_URL = process.env.PRTG_URL || 'https://192.168.0.150';
const PRTG_API_TOKEN = process.env.PRTG_API_TOKEN || '6WHDKBECT6SDBVHW3FC2QX2BIK6HAYX6LYQVTFMR5E======';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

router.get('/sensors', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${PRTG_BASE_URL}/api/table.json`, {
      params: {
        content: 'sensors',
        columns: 'sensor,status,lastvalue,lastup,lastdown,device,group',
        sortby: 'status',
        apitoken: PRTG_API_TOKEN,
        ...req.query
      },
      httpsAgent,
      timeout: 30000
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('PRTG API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch PRTG sensors', error: error.message });
  }
});

router.get('/devices', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${PRTG_BASE_URL}/api/table.json`, {
      params: {
        content: 'devices',
        columns: 'device,status,host,group,tags',
        sortby: 'status',
        apitoken: PRTG_API_TOKEN,
        ...req.query
      },
      httpsAgent,
      timeout: 30000
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('PRTG API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch PRTG devices', error: error.message });
  }
});

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${PRTG_BASE_URL}/api/table.json`, {
      params: {
        content: 'overview',
        columns: 'probe,group,device,sensor,status',
        apitoken: PRTG_API_TOKEN
      },
      httpsAgent,
      timeout: 30000
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('PRTG API error:', error.message);
    res.status(500).json({ message: 'Failed to fetch PRTG overview', error: error.message });
  }
});

export default router;