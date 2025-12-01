import { SuiClient } from '@mysten/sui/client';
import { config } from '../config';

export const suiClient = new SuiClient({ url: config.sui.rpcUrl });

export default suiClient;
