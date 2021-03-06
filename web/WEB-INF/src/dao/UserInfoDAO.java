package dao;
import entity.ForumaccountEntity;
import util.HibernateUtil;
import entity.TokenEntity;
import entity.UuserEntity;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.hibernate.query.Query;


import javax.swing.plaf.basic.BasicInternalFrameTitlePane;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2017/7/12.
 */
public class UserInfoDAO {
    private static final long TOKEN_OUT_OF_TIME_COUNT = 600000;

    private UserInfoDAO(){}

    private static Object lock = new Object();

    //tested
    public static boolean seekReuseEmail(String emailforseek){
        Session s = null;
        try{
            s = HibernateUtil.getSession();
            Criteria criteria = s.createCriteria(UuserEntity.class);

            criteria.add(Restrictions.eq("email",emailforseek));
            List<UuserEntity> list = criteria.list();

            if(list.isEmpty())
                return false;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }finally{
            HibernateUtil.safeCloseSession(s);
        }

        return true;
    }

    public static boolean createUser(String email,String nickname,String password,String sex,String birthday,String realname,String school,String grade){
        Session s = null;
        Session c = null;
        try{
            c = HibernateUtil.getSession();
            Criteria counter = c.createCriteria(UuserEntity.class);
            counter.setProjection(Projections.rowCount());

            long result = (Long)counter.uniqueResult();
            String newUserIDBuilder = String.format("%08d",result+1);
            String newUserID = "100" + newUserIDBuilder;

            s = HibernateUtil.getSession();
            s.beginTransaction();
            UuserEntity newUser = new UuserEntity();
            newUser.setUserid(newUserID);
            newUser.setEmail(email);
            newUser.setPassword(password);
            newUser.setNickname(nickname);
            newUser.setActivityvisibility("friend");
            if(birthday != null) newUser.setBirthday(Timestamp.valueOf(birthday));
            if(realname != null) newUser.setRealname(realname);
            if(school != null) newUser.setDepartment(school);
            if(grade != null) newUser.setGrade(grade);
            if(sex != null) newUser.setSex(sex);
            newUser.setRegisterdatetime(new Timestamp(System.currentTimeMillis()));
            newUser.setNumnotice(Short.valueOf("0"));

            ForumaccountEntity forumaccount = new ForumaccountEntity();
            forumaccount.setUserid(newUserID);
            forumaccount.setExp(0);
            forumaccount.setRank(1);
            forumaccount.setPrivilige(3);

            s.save(newUser);
            s.save(forumaccount);
            s.getTransaction().commit();
        }catch (Exception e){
            e.printStackTrace();
            s.getTransaction().rollback();
            return false;
        }finally{
            HibernateUtil.safeCloseSession(s);
            HibernateUtil.safeCloseSession(c);
        }

        return true;
    }
    //tested
    public static boolean validateUser(String email,String password){
        Session s = null;
        try{
            s = HibernateUtil.getSession();
            String hql = "from UuserEntity as user where user.email=:mail and user.password =:pswd";
            Query query = s.createQuery(hql);
            query.setParameter("mail",email);
            query.setParameter("pswd",password);

            List list = query.list();
            if(list.isEmpty())
                return false;
        }catch (Exception e){
            e.printStackTrace();
            return false;
        }finally {
            HibernateUtil.safeCloseSession(s);
        }

        return true;
    }
    //tested
    public static String getUserID(String contact){

        System.out.println(contact);
        Session s = null;
        String userid = "";
        try{
            s = HibernateUtil.getSession();
            Criteria user = s.createCriteria(UuserEntity.class);
            user.add(Restrictions.eq("email",contact));
            List result = user.list();
            if(result == null || result.isEmpty()) {
                return null;
            }
            UuserEntity entity = (UuserEntity) result.get(0);
            userid = entity.getUserid();
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            HibernateUtil.safeCloseSession(s);
        }

        System.out.println("UserID Found: " + userid);
        return userid;
    }
    //tested
    public static boolean saveToken(String id,String userid){
        Session s = null;
        try{
            s = HibernateUtil.getSession();
            s.beginTransaction();
            TokenEntity tk = new TokenEntity();
            tk.setTokenid(id);
            tk.setUserid(userid);
            tk.setLastactivetime(System.currentTimeMillis());
            s.save(tk);
            s.getTransaction().commit();
        }catch (Exception e){
            e.printStackTrace();
            s.getTransaction().rollback();
            return false;
        }finally {
            HibernateUtil.safeCloseSession(s);
        }

        return true;
    }
    //tested
    public static boolean deleteToken(String tokenID){
        Session s = null;
        Session t = null;
        try{
            s = HibernateUtil.getSession();

            String hql = "from TokenEntity as token where token.tokenid = :id";
            Query query = s.createQuery(hql);
            query.setString("id",tokenID);

            List list = query.list();
            if(list.isEmpty())
                return true;

            t = HibernateUtil.getSession();

            TokenEntity token = t.get(TokenEntity.class,tokenID);
            if(token == null)
                return true;

            t.beginTransaction();
            t.delete(token);
            t.getTransaction().commit();
        }catch (Exception e){
            e.printStackTrace();
            t.getTransaction().rollback();
            return false;
        }finally {
            HibernateUtil.safeCloseSession(s);
            HibernateUtil.safeCloseSession(t);
        }

        return true;
    }
    //tested
    public static boolean validateToken(String tokenid){
        Session s = null;
        Session t = null;
        try{
            //如果该token不存在，直接返回false
            s = HibernateUtil.getSession();
            Criteria nulltest = s.createCriteria(TokenEntity.class);
            nulltest.add(Restrictions.eq("tokenid",tokenid));
            List nulltestList = nulltest.list();
            if(nulltestList.isEmpty())
                return false;

            //如果该token存在但超时，返回false并删除该token
            long tokenTime = ((TokenEntity)nulltestList.get(0)).getLastactivetime();
            if(System.currentTimeMillis() - tokenTime >= TOKEN_OUT_OF_TIME_COUNT)
            {
                deleteToken(((TokenEntity)nulltestList.get(0)).getTokenid());
                return false;
            }

            //否则，更新此token的时间字段，并返回true
            t = HibernateUtil.getSession();
            t.beginTransaction();
            String hql = "update TokenEntity as token set token.lastactivetime =:currentTime where token.tokenid =:id";
            Query query = t.createQuery(hql);
            query.setParameter("currentTime",System.currentTimeMillis());
            query.setParameter("id",tokenid);
            query.executeUpdate();
            t.getTransaction().commit();

        }catch(Exception e){
            e.printStackTrace();
            t.getTransaction().rollback();
            return false;
        }finally {
            HibernateUtil.safeCloseSession(s);
            HibernateUtil.safeCloseSession(t);
        }
        return true;
    }

    public static String getUserByToken(String token){
        TokenEntity entity = (TokenEntity) CommonDAO.getItemByPK(TokenEntity.class,token);
        return entity.getUserid();
    }

    public static long getViewActTimeByToken(String tokenid) {

        synchronized (lock) {
        long viewActTime = System.currentTimeMillis();
        Session s = null;
        Session t = null;
        try{
            s = HibernateUtil.getSession();

            String hql = "from TokenEntity as token where token.tokenid = :id";
            Query query = s.createQuery(hql);
            query.setString("id",tokenid);

            List list = query.list();
            if(list.isEmpty())
                return viewActTime;

            t = HibernateUtil.getSession();

            t.beginTransaction();

            TokenEntity token = t.get(TokenEntity.class, tokenid);
            if(token == null)
                return viewActTime;
            System.out.println("token" + token);
            viewActTime = token.getViewActTime();

            t.getTransaction().commit();

        }catch (Exception e){
            //e.printStackTrace();
            t.getTransaction().rollback();
            return viewActTime;
        }finally {
            HibernateUtil.safeCloseSession(s);
            HibernateUtil.safeCloseSession(t);
        }

        return viewActTime;}

    }

    public static boolean updateViewActTime(String tokenid, long newTime) {

        synchronized (lock) {
        Session s = null;
        Session t = null;
        try{
            s = HibernateUtil.getSession();

            String hql = "from TokenEntity as token where token.tokenid = :id";
            Query query = s.createQuery(hql);
            query.setString("id",tokenid);

            List list = query.list();
            if(list.isEmpty())
                return false;

            t = HibernateUtil.getSession();

            TokenEntity token = t.get(TokenEntity.class,tokenid);
            if(token == null)
                return false;
            token.setViewActTime(newTime);

            t.beginTransaction();
            t.update(token);
            t.getTransaction().commit();
        }catch (Exception e){
            e.printStackTrace();
            t.getTransaction().rollback();
            return false;
        }finally {
            HibernateUtil.safeCloseSession(s);
            HibernateUtil.safeCloseSession(t);
        }

        return true;}
    }
    //tested
    public static UuserEntity[] searchNickname(String nickname){
        String hql="from UuserEntity e where e.nickname like :genStr";
        String advanced = "%" + nickname + "%";
        Map<String,Object> params = new HashMap<String,Object>();
        params.put("genStr",advanced);
        List list = CommonDAO.queryHql(hql,params);
        if(list == null)
            return null;

        UuserEntity[] array = new UuserEntity[list.size()];
        for(int i=0;i<array.length;i++)
            array[i] = (UuserEntity)list.get(i);

        return array;
    }
}
