package entity;

import java.io.Serializable;

/**
 * Created by Administrator on 2017/7/12.
 */
public class ShieldEntityPK implements Serializable {
    private String coaction;
    private String coactee;
    private String activityid;

    public String getCoaction() {
        return coaction;
    }

    public void setCoaction(String coaction) {
        this.coaction = coaction;
    }

    public String getCoactee() {
        return coactee;
    }

    public void setCoactee(String coactee) {
        this.coactee = coactee;
    }

    public String getActivityid() {
        return activityid;
    }

    public void setActivityid(String activityid) {
        this.activityid = activityid;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ShieldEntityPK that = (ShieldEntityPK) o;

        if (coaction != null ? !coaction.equals(that.coaction) : that.coaction != null) return false;
        if (coactee != null ? !coactee.equals(that.coactee) : that.coactee != null) return false;
        return activityid != null ? activityid.equals(that.activityid) : that.activityid == null;
    }

    @Override
    public int hashCode() {
        int result = coaction != null ? coaction.hashCode() : 0;
        result = 31 * result + (coactee != null ? coactee.hashCode() : 0);
        result = 31 * result + (activityid != null ? activityid.hashCode() : 0);
        return result;
    }
}
