import math

class CrowdGraph:
    def __init__(self):
        pass

    def build_graph(self, tracked_people):
        nodes = []
        edges = []

        for person in tracked_people:
            pid = person["id"]
            cx, cy = person["center"]

            nodes.append({
                "id": pid,
                "x": cx,
                "y": cy
            })

        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                n1 = nodes[i]
                n2 = nodes[j]

                dist = math.sqrt(
                    (n1["x"] - n2["x"]) ** 2 +
                    (n1["y"] - n2["y"]) ** 2
                )

                if dist < 80:
                    edges.append({
                        "source": n1["id"],
                        "target": n2["id"]
                    })

        return {
            "nodes": nodes,
            "edges": edges
        }