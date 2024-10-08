import { KafkaConsumer } from '@fdgn/kafka';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SeedKafkaConsumer extends KafkaConsumer<any> {
    async process(sources: any): Promise<void> {
        console.log(sources)
    }

}