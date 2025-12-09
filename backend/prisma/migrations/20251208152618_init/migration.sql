-- CreateTable
CREATE TABLE "Filiere" (
    "uid" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Filiere_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Response" (
    "uid" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Question" (
    "uid" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Reponse_Filiere" (
    "reponseId" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL,
    "valeur" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Candidat" (
    "uid" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "email" TEXT,
    "dateBirth" TIMESTAMP(3),

    CONSTRAINT "Candidat_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Candidat_Filiere" (
    "candidatId" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Candidat_Score" (
    "candidatId" TEXT NOT NULL,
    "filiereId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Atelier" (
    "uid" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dockerfilelink" TEXT NOT NULL,

    CONSTRAINT "Atelier_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Atelier_Candidat" (
    "atelierId" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Admin" (
    "uid" TEXT NOT NULL,
    "fristname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filiere_label_key" ON "Filiere"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Reponse_Filiere_reponseId_filiereId_key" ON "Reponse_Filiere"("reponseId", "filiereId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidat_email_key" ON "Candidat"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidat_Filiere_candidatId_filiereId_key" ON "Candidat_Filiere"("candidatId", "filiereId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidat_Score_candidatId_key" ON "Candidat_Score"("candidatId");

-- CreateIndex
CREATE UNIQUE INDEX "Atelier_Candidat_atelierId_candidatId_key" ON "Atelier_Candidat"("atelierId", "candidatId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reponse_Filiere" ADD CONSTRAINT "Reponse_Filiere_reponseId_fkey" FOREIGN KEY ("reponseId") REFERENCES "Response"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reponse_Filiere" ADD CONSTRAINT "Reponse_Filiere_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidat_Filiere" ADD CONSTRAINT "Candidat_Filiere_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidat_Filiere" ADD CONSTRAINT "Candidat_Filiere_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidat_Score" ADD CONSTRAINT "Candidat_Score_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidat_Score" ADD CONSTRAINT "Candidat_Score_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atelier_Candidat" ADD CONSTRAINT "Atelier_Candidat_atelierId_fkey" FOREIGN KEY ("atelierId") REFERENCES "Atelier"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atelier_Candidat" ADD CONSTRAINT "Atelier_Candidat_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
