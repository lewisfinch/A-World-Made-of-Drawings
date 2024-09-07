/* Assignment 6: Harold: A World Made of Drawings
 * UMN CSci-4611 Instructors 2018+
 * Stroke3DFactory class by Prof. Dan Keefe, Fall 2023
 * Please do not distribute beyond the CSci-4611 course
 */

import * as gfx from 'gophergfx'
import { Stroke2D } from './Stroke2D';
import { Billboard } from './Billboard';


/** 
 * This class holds static functions to handle the cases where the user's Stroke2D should be turned into
 * a new geometry, like a Mesh3 that goes in the sky or a Billboard that is attached to the ground. 
 */
export class Stroke3DFactory {

    /**
     * Creates and returns a new Mesh3 by projecting the Stroke2D drawn by the user onto a sky sphere
     * of the specified radius.
     * 
     * @param stroke2D The stroke drawn by the user. All the points and vertices of this stroke will
     * be defined in normalized device coordinates (-1,-1) to (1,1).
     * @param camera The camera used while drawing the stroke. This is used within the routine to
     * create pick rays that originate at the camera's position and pass through the vertices of the
     * stroke2D.
     * @param skyRadius The radius of the sky sphere the stroke is projected onto.
     * @returns A new Mesh3 that holds the projected version of the stroke and can be added to the scene.
     */
    public static createSkyStrokeMesh(stroke2D: Stroke2D, camera: gfx.Camera, skyRadius: number): gfx.Mesh3 {
        // TODO: Part 1: Draw Sky Strokes

        // Hint #1: The Ray class in GopherGfx has an intersectsSphere() routine that you can use to
        // project the stroke2D onto a "sky sphere".

        // Hint #2: When creating a new Mesh3, you can setup it's material to be the same color as the stroke2D with:

        const newMesh = new gfx.Mesh3();
        newMesh.material = new gfx.UnlitMaterial();
        newMesh.material.side = gfx.Side.DOUBLE;
        newMesh.material.setColor(stroke2D.color);

        const vertices3D: gfx.Vector3[] = [];

        for (const vertex2D of stroke2D.vertices) {
            const coords = new gfx.Vector2(vertex2D.x, vertex2D.y);
            const ray = new gfx.Ray3();
            ray.setPickRay(coords, camera);

            const skySphere = new gfx.BoundingSphere();
            skySphere.center = new gfx.Vector3(0, 0, 0);
            skySphere.radius = skyRadius;

            const intersection = ray.intersectsSphere(skySphere);

            if (intersection) {
                vertices3D.push(intersection);
            }
        }
        newMesh.setVertices(vertices3D);
        newMesh.setIndices(stroke2D.indices);
        return newMesh;
    }


    /** 
     * Creates and returns a new Billboard object by projecting the Stroke2D drawn by the user onto a 3D plane.
     * The plane is defined by a point within the plane (anchorPointWorld) and a normal, which points from the
     * billboard's anchor point to the camera but without any variation in Y since the billboards in Harold are
     * always vertical planes (i.e., with no tilt up or down). 
     * 
     * Note, the Billboard class is just a small wrapper around a Mesh3.  So, the majority of the functionality
     * in this routine relates to projecting the stroke2D onto a plane and creating a new Mesh3 to hold the
     * result.  This new Mesh3 is then wrapped in a new Billboard object.
     * 
     * @param stroke2D The stroke drawn by the user. All the points and vertices of this stroke will
     * be defined in normalized device coordinates (-1,-1) to (1,1).
     * @param camera The camera used while drawing the stroke. This is used within the routine to
     * create pick rays that originate at the camera's position and pass through the vertices of the
     * stroke2D.
     * @param anchorPointWorld The 3D point on the ground that the billboard should be attached to and
     * rotate around.
     * @returns A new Billboard object that can be added to the scene.
     */
    public static createBillboard(stroke2D: Stroke2D, camera: gfx.Camera, anchorPointWorld: gfx.Vector3): Billboard {
        // TODO: Part 2: Draw Billboards Attached to the Ground

        // Hint #1: To get the position of the camera in world coordinates, you can use the camera's localToWorld matrix
        // to transform the origin of camera space (0,0,0) to world space.

        // Hint #2: When creating a new Mesh3, you can setup it's material to be the same color as the stroke2D with:

        const newMesh = new gfx.Mesh3();
        newMesh.material = new gfx.UnlitMaterial();
        newMesh.material.side = gfx.Side.DOUBLE;
        newMesh.material.setColor(stroke2D.color);

        const camPos = (camera.localToWorldMatrix).transformPoint(new gfx.Vector3(0, 0, 0));
        const billboardNormal = camPos.clone();
        billboardNormal.subtract(anchorPointWorld);
        billboardNormal.normalize();

        const vertices3D: gfx.Vector3[] = [];

        for (const vertex2D of stroke2D.vertices) {
            const coords = new gfx.Vector2(vertex2D.x, vertex2D.y);
            const ray = new gfx.Ray3();
            ray.setPickRay(coords, camera);

            const plane = new gfx.Plane3(anchorPointWorld, billboardNormal);
            const intersection = ray.intersectsPlane(plane);

            if (intersection) {
                vertices3D.push(intersection);
            }
        }
        newMesh.setVertices(vertices3D);
        newMesh.setIndices(stroke2D.indices);

        const billboard = new Billboard(anchorPointWorld, billboardNormal, newMesh);
        return billboard;
    }
}
