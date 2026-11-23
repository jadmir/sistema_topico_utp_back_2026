import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    
    private readonly client: SupabaseClient;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const supabaseUrl = 
            this.configService.get<string>('SUPABASE_URL');

        const supabaseKey =
            this.configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl) {
            throw new Error(
                'SUPABASE_URL no está configurada.'
            )
        }

        if (!supabaseKey) {
            throw new Error(
                'SUPABASE_KEY no está configurada.'
            )
        }

        this.client = createClient(
            supabaseUrl,
            supabaseKey
        )
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}
