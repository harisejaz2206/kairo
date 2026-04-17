import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftAsset } from './entities/draft-asset.entity.js';

// Draft generation logic lives in Phase 4. Module exists now so the entity
// is registered and available for relations in other modules.
@Module({
  imports: [TypeOrmModule.forFeature([DraftAsset])],
  exports: [TypeOrmModule],
})
export class DraftsModule {}
