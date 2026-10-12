"""
GoPAL-AI Cassidy Production Orchestrator.
The central brain of the Cassidy production factory.
Manages stage progression, persistent checkpoints, quality gating, and crash resumption.
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from factory.checkpoints import (
    CHECKPOINT_FILES,
    STAGE_SEQUENCE,
    find_latest_checkpoint,
    get_checkpoint_path,
    is_valid_checkpoint,
    load_checkpoint,
    save_checkpoint,
)
from factory.orchestrator.state import OrchestratorState

DEFAULT_JOB_PATH = Path("jobs/cassidy-production.json")
DEFAULT_ARTIFACTS_DIR = Path("artifacts/cassidy")


class CassidyProductionOrchestrator:
    def __init__(
        self,
        repo_dir: Optional[Path] = None,
        job_path: Optional[Path] = None,
        state_path: Optional[Path] = None,
    ):
        self.repo_dir = (repo_dir or Path(".")).resolve()
        self.job_path = (job_path or (self.repo_dir / DEFAULT_JOB_PATH)).resolve()
        self.artifacts_dir = (self.repo_dir / DEFAULT_ARTIFACTS_DIR).resolve()
        self.state_file = (state_path or (self.repo_dir / "build/cassidy/orchestrator-state.json")).resolve()
        self.state = OrchestratorState.load(self.state_file)
        self.job = self._load_job()

    def _load_job(self) -> Dict[str, Any]:
        if self.job_path.is_file():
            try:
                with open(self.job_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[GoPAL-ORCHESTRATOR] Warning: Failed to parse job file: {e}", flush=True)
        return {"character": "Cassidy", "job_id": "default-job"}

    def _get_job_hash(self) -> Optional[str]:
        import hashlib
        if self.job_path.is_file():
            with open(self.job_path, "rb") as f:
                return hashlib.sha256(f.read()).hexdigest()
        return None

    def status(self) -> Dict[str, Any]:
        """Return machine-readable and human-friendly status."""
        last_stage, last_chk = find_latest_checkpoint(self.repo_dir)
        return {
            "character": self.job.get("character", "Cassidy"),
            "job_id": self.job.get("job_id", "default"),
            "current_stage": self.state.current_stage,
            "last_valid_checkpoint_stage": last_stage,
            "last_valid_checkpoint_file": str(last_chk) if last_chk else None,
            "stage_statuses": self.state.stage_statuses,
            "diagnostics_count": len(self.state.diagnostics),
            "artifacts_dir": str(self.artifacts_dir),
            "last_updated": self.state.last_updated,
        }

    def run_stage_inside_blender(self, stage: str, checkpoint_to_load: Optional[Path] = None) -> bool:
        """Called inside Blender Python environment to execute a single stage."""
        import bpy
        from factory.authoring.reference import load_canonical_reference
        from factory.authoring.materials import build_cassidy_materials
        from factory.authoring.mesh_builder import create_root_node, create_stylized_head, create_stylized_body, create_stylized_hands
        from factory.authoring.face_eyes import create_face_and_eyes
        from factory.authoring.hair_builder import create_hair_hierarchy
        from factory.authoring.charm_builder import create_signature_charm
        from factory.authoring.rigging import create_armature
        from factory.authoring.facial_rig import add_facial_bones
        from factory.authoring.gaze_system import setup_gaze_system
        from factory.authoring.expressions import author_expressions
        from factory.authoring.animations import author_animations
        from factory.authoring.lods import setup_lods
        from factory.authoring.visual_staging import setup_visual_staging
        from factory.validation.cassidy_validator import validate_cassidy_scene
        from factory.validation.scene_validator import validate_production_scene
        from factory.export import export_glb
        from factory.evidence import collect_blender_evidence, save_evidence_report
        from factory.package import build_package_manifest, generate_checksums
        from factory.acceptance import run_acceptance_gate
        from factory.bootstrap import initialize

        print(f"[GoPAL-ORCHESTRATOR] >>> Executing Stage: {stage} <<<", flush=True)

        # 1. Load incoming checkpoint if specified
        if checkpoint_to_load and checkpoint_to_load.is_file():
            load_checkpoint(checkpoint_to_load)
        elif stage == "INIT":
            initialize()

        # Load canonical identity
        identity_path = self.repo_dir / "contracts/cassidy-identity.json"
        ref_data = load_canonical_reference(identity_path) if identity_path.is_file() else {}
        palette = ref_data.get("palette", {})

        # Execute Stage Handler
        if stage == "INIT":
            pass  # Already initialized clean scene

        elif stage == "REFERENCE":
            # Tag reference metadata in scene
            bpy.context.scene["canonical_character"] = "Cassidy"
            bpy.context.scene["canonical_version"] = "1.0.0"

        elif stage == "BASE_MESH":
            root_obj = create_root_node()
            materials = build_cassidy_materials(palette)
            create_stylized_head(root_obj, materials)
            create_stylized_body(root_obj, materials)
            create_stylized_hands(root_obj, materials)

        elif stage in ("FACE", "EYES"):
            head_obj = bpy.data.objects.get("Cassidy_Head")
            if not head_obj:
                raise RuntimeError("Cassidy_Head missing for Face/Eyes stage")
            materials = build_cassidy_materials(palette)
            create_face_and_eyes(head_obj, materials)

        elif stage == "HAIR":
            head_obj = bpy.data.objects.get("Cassidy_Head")
            materials = build_cassidy_materials(palette)
            create_hair_hierarchy(head_obj, materials)

        elif stage == "OUTFIT":
            pass  # Body mesh and outfit layers are verified/refined

        elif stage == "CHARM":
            body_obj = bpy.data.objects.get("Cassidy_Body")
            materials = build_cassidy_materials(palette)
            create_signature_charm(body_obj, materials)

        elif stage == "MATERIALS":
            build_cassidy_materials(palette)

        elif stage == "BODY_RIG":
            root_obj = bpy.data.objects.get("Cassidy_Root")
            create_armature(root_obj)

        elif stage == "FACIAL_RIG":
            arm_obj = bpy.data.objects.get("Cassidy_Armature")
            if arm_obj:
                add_facial_bones(arm_obj)

        elif stage == "GAZE":
            root_obj = bpy.data.objects.get("Cassidy_Root")
            setup_gaze_system(root_obj)

        elif stage == "EXPRESSIONS":
            face_obj = bpy.data.objects.get("Cassidy_Face")
            author_expressions(face_obj)

        elif stage == "ANIMATIONS":
            arm_obj = bpy.data.objects.get("Cassidy_Armature")
            author_animations(arm_obj)

        elif stage == "LODS":
            root_obj = bpy.data.objects.get("Cassidy_Root")
            if root_obj:
                setup_lods(root_obj)

        elif stage == "VISUAL_STAGING":
            setup_visual_staging()

        elif stage == "VALIDATION":
            report = validate_cassidy_scene()
            if not report["valid"]:
                raise RuntimeError(f"Cassidy validation failed: {report['errors']}")

        elif stage == "EXPORT":
            export_glb(base_dir=self.repo_dir)

        elif stage == "PACKAGE":
            evidence = collect_blender_evidence()
            evidence_file = self.artifacts_dir / "validation-evidence.json"
            save_evidence_report(evidence, evidence_file)
            build_package_manifest(
                character="Cassidy",
                glb_path=self.artifacts_dir / "cassidy-runtime.glb",
                evidence=evidence,
                artifacts_dir=self.artifacts_dir,
            )
            generate_checksums(self.artifacts_dir)

        elif stage == "ACCEPTANCE":
            acc_report = run_acceptance_gate(
                glb_path=self.artifacts_dir / "cassidy-runtime.glb",
                artifacts_dir=self.artifacts_dir,
            )
            if acc_report["verdict"] != "PASS":
                raise RuntimeError("Acceptance gate failed to certify Cassidy asset")

        elif stage == "DONE":
            print("[GoPAL-ORCHESTRATOR] Cassidy production pipeline fully completed!", flush=True)

        # Quality Gate Verification for stage
        scene_errors = validate_production_scene()
        if scene_errors:
            raise RuntimeError(f"Scene validation errors at stage {stage}: {scene_errors}")

        # Save checkpoint if this stage is designated as a checkpoint boundary
        chk_filename = CHECKPOINT_FILES.get(stage)
        saved_chk_path = None
        if chk_filename:
            saved_chk_path = save_checkpoint(stage, base_dir=self.repo_dir)

        self.state.mark_stage(stage, "COMPLETED", checkpoint=str(saved_chk_path) if saved_chk_path else None)
        self.state.save(self.state_file)
        return True

    def build(self, from_scratch: bool = False) -> bool:
        """Run complete production pipeline from start or resume point."""
        print(f"[GoPAL-ORCHESTRATOR] Initiating Cassidy Factory Build (from_scratch={from_scratch})", flush=True)
        start_index = 0

        if from_scratch:
            self.state = OrchestratorState(job_id=self.job.get("job_id", "prod-001"))
            self.state.save(self.state_file)
        else:
            # Check if there is an existing checkpoint to resume from
            last_stage, last_chk = find_latest_checkpoint(self.repo_dir)
            if last_stage and last_stage in STAGE_SEQUENCE:
                idx = STAGE_SEQUENCE.index(last_stage)
                start_index = min(idx + 1, len(STAGE_SEQUENCE) - 1)
                print(f"[GoPAL-ORCHESTRATOR] Found checkpoint {last_chk.name} from {last_stage}. Resuming at {STAGE_SEQUENCE[start_index]}.", flush=True)

        return self._execute_pipeline(start_index=start_index)

    def resume(self) -> bool:
        """Explicit resume command: pick up from the last successful checkpoint."""
        last_stage, last_chk = find_latest_checkpoint(self.repo_dir)
        if not last_stage:
            print("[GoPAL-ORCHESTRATOR] No valid checkpoint found to resume from. Starting from INIT.", flush=True)
            return self.build(from_scratch=True)

        current_idx = STAGE_SEQUENCE.index(last_stage)
        next_idx = min(current_idx + 1, len(STAGE_SEQUENCE) - 1)
        next_stage = STAGE_SEQUENCE[next_idx]

        print(f"[GoPAL-ORCHESTRATOR] Resuming from checkpoint: {last_chk.name} ({last_stage}) -> Starting {next_stage}", flush=True)
        return self._execute_pipeline(start_index=next_idx, resume_checkpoint=last_chk)

    def repair(self, target_stage: Optional[str] = None) -> bool:
        """Re-run a specific stage and rebuild forward."""
        stage = (target_stage or self.state.current_stage).upper()
        if stage not in STAGE_SEQUENCE:
            print(f"[GoPAL-ORCHESTRATOR] Error: Unknown stage '{stage}' for repair.", flush=True)
            return False

        idx = STAGE_SEQUENCE.index(stage)
        # Find preceding checkpoint
        preceding_chk = None
        for prev_stage in reversed(STAGE_SEQUENCE[:idx]):
            chk_path = get_checkpoint_path(prev_stage, self.repo_dir)
            if is_valid_checkpoint(chk_path):
                preceding_chk = chk_path
                break

        print(f"[GoPAL-ORCHESTRATOR] Repairing from stage {stage} (loading {preceding_chk})", flush=True)
        return self._execute_pipeline(start_index=idx, resume_checkpoint=preceding_chk)

    def _execute_pipeline(self, start_index: int = 0, resume_checkpoint: Optional[Path] = None) -> bool:
        """Execute stages sequentially via Blender runner."""
        start_time = time.time()
        runner_script = self.repo_dir / "factory/orchestrator/blender_runner.py"

        # Generate production-report skeleton
        report_data = {
            "job_id": self.job.get("job_id", "default"),
            "character": "Cassidy",
            "start_time": datetime.now(timezone.utc).isoformat(),
            "start_stage": STAGE_SEQUENCE[start_index],
            "stages_executed": [],
            "status": "RUNNING",
        }

        current_chk = resume_checkpoint
        if current_chk is None and start_index > 0:
            prev_stage = STAGE_SEQUENCE[start_index - 1]
            candidate_chk = get_checkpoint_path(prev_stage, self.repo_dir)
            if is_valid_checkpoint(candidate_chk):
                current_chk = candidate_chk
            else:
                _, latest_chk = find_latest_checkpoint(self.repo_dir)
                current_chk = latest_chk

        for i in range(start_index, len(STAGE_SEQUENCE)):
            stage = STAGE_SEQUENCE[i]
            print(f"\n=======================================================", flush=True)
            print(f" [FACTORY STAGE {i+1}/{len(STAGE_SEQUENCE)}] {stage}", flush=True)
            print(f"=======================================================", flush=True)

            self.state.mark_stage(stage, "RUNNING")
            self.state.save(self.state_file)

            # Invoke Blender for this stage
            chk_arg = str(current_chk) if current_chk else ""
            cmd = [
                "blender",
                "--background",
                "--factory-startup",
                "--python",
                str(runner_script),
                "--",
                stage,
                chk_arg,
                str(self.repo_dir),
            ]

            stage_start = time.time()
            try:
                proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=True)
                print(proc.stdout, flush=True)
                duration = round(time.time() - stage_start, 2)
                report_data["stages_executed"].append({
                    "stage": stage,
                    "duration_seconds": duration,
                    "status": "SUCCESS",
                })
                # Reload updated state from Blender subprocess
                self.state = OrchestratorState.load(self.state_file)
                # Update checkpoint for next stage
                current_chk = get_checkpoint_path(stage, self.repo_dir)
            except subprocess.CalledProcessError as e:
                duration = round(time.time() - stage_start, 2)
                err_msg = f"Stage {stage} failed with return code {e.returncode}."
                print(f"[GoPAL-ORCHESTRATOR] ERROR: {err_msg}", flush=True)
                print(e.stdout, flush=True)

                self.state.mark_stage(stage, "FAILED")
                self.state.add_diagnostic(err_msg)
                self.state.save(self.state_file)

                report_data["status"] = "FAILED"
                report_data["failed_stage"] = stage
                report_data["error"] = err_msg
                self._save_production_report(report_data)
                return False

        report_data["status"] = "COMPLETED"
        report_data["total_duration_seconds"] = round(time.time() - start_time, 2)
        report_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        self._save_production_report(report_data)

        self.state = OrchestratorState.load(self.state_file)
        self.state.mark_stage("DONE", "COMPLETED")
        self.state.job_hash = self._get_job_hash()
        self.state.save(self.state_file)

        print("\n[GoPAL-ORCHESTRATOR] *** CASSIDY PRODUCTION RUN COMPLETED SUCCESSFULLY ***", flush=True)
        return True

    def _save_production_report(self, report_data: Dict[str, Any]):
        out_file = self.artifacts_dir / "production-report.json"
        out_file.parent.mkdir(parents=True, exist_ok=True)
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2)
        print(f"[GoPAL-ORCHESTRATOR] Production report saved: {out_file}", flush=True)
