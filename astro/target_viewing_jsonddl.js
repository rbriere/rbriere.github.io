class ViewingTarget {
    constructor(data) {
        this.Rank = data.Rank;
        this.Target = data.Target;
        this.CardinalDirection = data.CardinalDirection;
        this.GeneralDirection = data.GeneralDirection;
        this.Constellation = data.Constellation;
        this.DistanceLY = data.DistanceLY;
        this.Messier = data.Messier;
        this.Altitude = data.Altitude;
        this.NGC = data.NGC;
    }

    getCombinedTarget() {

        let parts = [];

        if (this.Target)
            parts.push(this.Target);

        if (this.Messier)
            parts.push(this.Messier);

        if (this.NGC)
            parts.push(this.NGC);

        return parts.join(" | ");
    }

    getDistanceMillions() {
        return (this.DistanceLY / 1000000).toFixed(2);
    }
}