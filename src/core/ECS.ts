/**
 * Simple, efficient ECS Manager
 */

export type EntityId = string;

export class ECS {
    private static nextEntityId = 0;
    private entities = new Set<EntityId>();
    private components = new Map<string, Map<EntityId, any>>();

    public createEntity(): EntityId {
        const id = (ECS.nextEntityId++).toString();
        this.entities.add(id);
        return id;
    }

    public destroyEntity(id: EntityId): void {
        this.entities.delete(id);
        for (const componentMap of this.components.values()) {
            componentMap.delete(id);
        }
    }

    public addComponent<T>(entityId: EntityId, componentName: string, data: T): void {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map<EntityId, any>());
        }
        this.components.get(componentName)!.set(entityId, data);
    }

    public getComponent<T>(entityId: EntityId, componentName: string): T | undefined {
        return this.components.get(componentName)?.get(entityId);
    }

    public query(componentNames: string[]): EntityId[] {
        if (componentNames.length === 0) return Array.from(this.entities);

        // Find the smallest map to start filtering (optimization)
        const sortedComponents = [...componentNames].sort((a, b) => {
            const countA = this.components.get(a)?.size || 0;
            const countB = this.components.get(b)?.size || 0;
            return countA - countB;
        });

        const firstMap = this.components.get(sortedComponents[0]);
        if (!firstMap) return [];

        return Array.from(firstMap.keys()).filter(id => {
            return componentNames.every(name => this.components.get(name)?.has(id));
        });
    }
}
