import { describe, expect, it } from 'vitest';
import { makeSeed } from '@/data/seed';
import { moduleKeys } from '@/config/modules';
import { LocalRepository, workspaceService } from '@/services/repository';
describe('Cognivax demo requirements',()=>{
 it('opens with the specified fixed user',()=>{const {profile}=makeSeed();expect(profile.name).toBe('Kavindu Jayasinghe');expect(profile.title).toBe('Founder & Chief Architect');expect(profile.email).toBe('kavindu@cognivax.net');});
 it('seeds 15–25 realistic records in every module',()=>{const db=makeSeed();for(const module of moduleKeys){const count=db.records.filter(r=>r.module===module).length;expect(count).toBeGreaterThanOrEqual(15);expect(count).toBeLessThanOrEqual(25);}expect(db.activity).toHaveLength(60);expect(db.notifications).toHaveLength(15);});
 it('keeps every seed cross-link valid',()=>{const db=makeSeed();const ids=new Set(db.records.map(r=>r.id));for(const record of db.records)for(const link of record.links)expect(ids.has(link)).toBe(true);});
 it('records CRUD and status changes in the audit trail and notifies status changes',async()=>{await workspaceService.reset();const repo=new LocalRepository('knowledge');const created=await repo.create({title:'Regression verification',summary:'Repository workflow test',status:'Draft'});expect(created.id).toBe('KNW-00021');await repo.update(created.id,{status:'Published'});const db=await workspaceService.get();expect(db.activity.some(a=>a.recordId===created.id&&a.action==='created')).toBe(true);expect(db.activity.some(a=>a.recordId===created.id&&a.action==='status changed')).toBe(true);expect(db.notifications.some(n=>n.recordId===created.id)).toBe(true);await repo.remove(created.id);expect(await repo.getById(created.id)).toBeUndefined();});
});
