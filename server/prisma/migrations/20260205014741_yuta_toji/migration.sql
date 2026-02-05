-- CreateTable
CREATE TABLE "diagrams" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mermaid_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagram_versions" (
    "id" TEXT NOT NULL,
    "diagram_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "mermaid_code" TEXT NOT NULL,
    "changelog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagram_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diagram_versions_diagram_id_version_key" ON "diagram_versions"("diagram_id", "version");

-- AddForeignKey
ALTER TABLE "diagrams" ADD CONSTRAINT "diagrams_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_versions" ADD CONSTRAINT "diagram_versions_diagram_id_fkey" FOREIGN KEY ("diagram_id") REFERENCES "diagrams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
