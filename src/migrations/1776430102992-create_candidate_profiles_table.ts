import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCandidateProfilesTable1776430102992 implements MigrationInterface {
    name = 'CreateCandidateProfilesTable1776430102992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "candidate_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "display_name" character varying(100) NOT NULL, "target_titles" jsonb NOT NULL DEFAULT '[]', "target_countries" jsonb NOT NULL DEFAULT '[]', "target_locations" jsonb, "preferred_keywords" jsonb NOT NULL DEFAULT '[]', "excluded_keywords" jsonb NOT NULL DEFAULT '[]', "must_have_rules" jsonb NOT NULL DEFAULT '[]', "nice_to_have_rules" jsonb NOT NULL DEFAULT '[]', "remote_preferences" jsonb, "visa_preferences" jsonb, "experience_years" numeric(4,1), "stack_summary" text, "master_resume_text" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e8cf5b54118601673585218cc4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "candidate_profiles"`);
    }

}
